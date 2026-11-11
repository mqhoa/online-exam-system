package com.mqhoa.onlineexam.ai.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import com.mqhoa.onlineexam.ai.dto.AiGenerationDtos.GeneratedQuestion;
import com.mqhoa.onlineexam.ai.repository.AiGenerationRepository;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.question.QuestionType;
import com.mqhoa.onlineexam.question.dto.QuestionOptionRequest;
import com.mqhoa.onlineexam.question.service.QuestionService;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiGenerationWorker {
    private final AiGenerationRepository jobs;private final ObjectMapper json;private final QuestionService questions;
    private final String apiKey;private final String model;private final RestClient rest;
    public AiGenerationWorker(AiGenerationRepository jobs,ObjectMapper json,QuestionService questions,
            @Value("${app.ai.gemini-api-key:}") String apiKey,@Value("${app.ai.gemini-model:gemini-3.8-flash}") String model){this.jobs=jobs;this.json=json;this.questions=questions;this.apiKey=apiKey;this.model=model;var factory=new org.springframework.http.client.SimpleClientHttpRequestFactory();factory.setConnectTimeout(java.time.Duration.ofSeconds(15));factory.setReadTimeout(java.time.Duration.ofSeconds(120));this.rest=RestClient.builder().requestFactory(factory).build();}

    @Async
    public void generate(long jobId,Path pdf,String topic,int count,String difficulty){
        try{
            jobs.markProcessing(jobId);
            if(apiKey.isBlank())throw new InvalidRequestException("Backend chưa cấu hình GEMINI_API_KEY");
            String text;
            try(var document=Loader.loadPDF(Files.readAllBytes(pdf))){text=new PDFTextStripper().getText(document);}
            if(text==null||text.isBlank())throw new InvalidRequestException("PDF không có lớp văn bản đọc được; PDF scan chưa được hỗ trợ");
            if(text.length()>65000)text=text.substring(0,65000);
            String prompt="Tạo đúng "+count+" câu hỏi trắc nghiệm/câu trả lời ngắn từ nội dung tài liệu dưới đây. Chủ đề: "+topic+". Độ khó: "+difficulty+". " +
                    "Chỉ trả JSON hợp lệ dạng {\"questions\":[{\"content\":string,\"questionType\":\"SINGLE_CHOICE|MULTIPLE_CHOICE|SHORT_ANSWER\",\"explanation\":string,\"options\":[{\"content\":string,\"correct\":boolean}]}]}. " +
                    "SINGLE_CHOICE phải có ít nhất 2 options và đúng chính xác 1; MULTIPLE_CHOICE có ít nhất 3 options, ít nhất 2 đúng và ít nhất 1 sai; SHORT_ANSWER có 1-5 đáp án mẫu và tất cả correct=true. Không đưa đáp án vào nội dung câu hỏi. Tài liệu:\n"+text;
            String body=rest.post().uri("https://generativelanguage.googleapis.com/v1beta/models/"+model+":generateContent")
                    .header("x-goog-api-key",apiKey).body(Map.of("contents",List.of(Map.of("parts",List.of(Map.of("text",prompt)))),"generationConfig",Map.of("responseMimeType","application/json")))
                    .retrieve().body(String.class);
            JsonNode root=json.readTree(body);String answer=root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
            List<GeneratedQuestion> generated=json.convertValue(json.readTree(answer).path("questions"),new TypeReference<List<GeneratedQuestion>>(){});
            if(generated.size()!=count)throw new InvalidRequestException("Gemini trả số lượng câu hỏi không đúng yêu cầu");
            for(GeneratedQuestion q:generated){List<QuestionOptionRequest> opts=q.options()==null?List.of():q.options().stream().map(o->new QuestionOptionRequest(o.content(),o.correct())).toList();questions.validateImportedQuestion(q.content(),q.questionType(),opts);}
            jobs.complete(jobId,json.writeValueAsString(generated));
        }catch(Exception e){jobs.fail(jobId,safeMessage(e));}
        finally{try{Files.deleteIfExists(pdf);}catch(Exception ignored){}}
    }
    private String safeMessage(Exception e){String m=e.getMessage();if(m==null||m.isBlank())return "Không thể xử lý tài liệu AI";return m.length()>500?m.substring(0,500):m;}
}
