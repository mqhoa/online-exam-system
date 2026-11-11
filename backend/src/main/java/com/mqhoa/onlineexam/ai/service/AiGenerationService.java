package com.mqhoa.onlineexam.ai.service;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import com.mqhoa.onlineexam.ai.dto.AiGenerationDtos.*;
import com.mqhoa.onlineexam.ai.repository.AiGenerationRepository;
import com.mqhoa.onlineexam.ai.repository.AiGenerationRepository.JobRecord;
import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.common.ResourceNotFoundException;
import com.mqhoa.onlineexam.question.dto.CreateQuestionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionOptionRequest;
import com.mqhoa.onlineexam.question.repository.QuestionReferenceRepository;
import com.mqhoa.onlineexam.question.service.QuestionService;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AiGenerationService {
    private final AiGenerationRepository jobs;private final AiGenerationWorker worker;private final QuestionService questions;private final QuestionReferenceRepository references;private final ObjectMapper json;private final Path uploadDirectory;
    public AiGenerationService(AiGenerationRepository jobs,AiGenerationWorker worker,QuestionService questions,QuestionReferenceRepository references,ObjectMapper json,@Value("${app.ai.upload-dir:./uploads/ai}") String uploadDirectory){this.jobs=jobs;this.worker=worker;this.questions=questions;this.references=references;this.json=json;this.uploadDirectory=Path.of(uploadDirectory).toAbsolutePath().normalize();}

    public JobView create(long groupId,MultipartFile file,String topic,int count,String difficulty,Authentication auth){
        requireTeacher(auth);if(!references.canManageGroup(auth.getName(),groupId))throw new ForbiddenOperationException("You are not assigned to this teacher group");
        if(file==null||file.isEmpty()||file.getSize()>10*1024*1024)throw new InvalidRequestException("PDF phải có dung lượng từ 1 byte đến 10 MB");
        String filename=Objects.toString(file.getOriginalFilename(),"");if(!filename.toLowerCase(Locale.ROOT).endsWith(".pdf"))throw new InvalidRequestException("Chỉ hỗ trợ tệp PDF");
        if(topic==null||topic.isBlank()||topic.length()>300)throw new InvalidRequestException("Chủ đề bắt buộc, tối đa 300 ký tự");if(count<1||count>20)throw new InvalidRequestException("Số câu hỏi phải từ 1 đến 20");
        if(difficulty==null||!Set.of("EASY","MEDIUM","HARD").contains(difficulty.toUpperCase(Locale.ROOT)))throw new InvalidRequestException("Độ khó phải là EASY, MEDIUM hoặc HARD");
        try{Files.createDirectories(uploadDirectory);byte[] bytes=file.getBytes();if(bytes.length<5||!new String(bytes,0,5,java.nio.charset.StandardCharsets.US_ASCII).equals("%PDF-"))throw new InvalidRequestException("Tệp tải lên không phải PDF hợp lệ");Path stored=uploadDirectory.resolve(UUID.randomUUID()+".pdf").normalize();if(!stored.startsWith(uploadDirectory))throw new InvalidRequestException("Đường dẫn tệp không hợp lệ");Files.write(stored,bytes);long teacherId=references.userId(auth.getName());long id=jobs.create(teacherId,groupId,stored.toString(),filename);worker.generate(id,stored,topic.trim(),count,difficulty.toUpperCase(Locale.ROOT));return view(find(id,auth));}
        catch(IOException ex){throw new InvalidRequestException("Không thể lưu tệp PDF");}
    }

    public JobView get(long id,Authentication auth){return view(find(id,auth));}

    @Transactional
    public ApproveResponse approve(long id,List<Integer> indexes,Authentication auth){JobRecord job=find(id,auth);if(!"COMPLETED".equals(job.status()))throw new InvalidRequestException("Chỉ có thể duyệt job đã hoàn tất");if(indexes==null||indexes.isEmpty())throw new InvalidRequestException("Chọn ít nhất một câu hỏi để lưu");
        List<GeneratedQuestion> generated=decode(job.result());Set<Integer> unique=new HashSet<>();for(Integer i:indexes)if(i==null||i<0||i>=generated.size()||!unique.add(i))throw new InvalidRequestException("Danh sách số thứ tự câu hỏi không hợp lệ");long userId=references.userId(auth.getName());
        for(Integer i:indexes){GeneratedQuestion q=generated.get(i);List<QuestionOptionRequest> opts=q.options().stream().map(o->new QuestionOptionRequest(o.content(),o.correct())).toList();questions.create(new CreateQuestionRequest(job.groupId(),userId,q.content(),q.questionType(),opts),auth.getName());}return new ApproveResponse(indexes.size());}

    private JobRecord find(long id,Authentication auth){JobRecord job=jobs.find(id).orElseThrow(()->new ResourceNotFoundException("AI generation job",id));if(!"ADMIN".equals(role(auth))&&job.teacherId()!=references.userId(auth.getName()))throw new ForbiddenOperationException("You cannot access this AI job");return job;}
    private List<GeneratedQuestion> decode(String value){try{return json.readValue(value,new TypeReference<>(){});}catch(Exception e){throw new InvalidRequestException("Không đọc được kết quả AI");}}
    private JobView view(JobRecord job){return new JobView(job.id(),job.groupId(),job.status(),job.errorMessage(),job.createdAt(),job.result()==null?List.of():decode(job.result()));}
    private String role(Authentication auth){return auth.getAuthorities().stream().map(a->a.getAuthority()).filter(a->a.startsWith("ROLE_")).map(a->a.substring(5)).findFirst().orElse("");}
    private void requireTeacher(Authentication auth){if(!"TEACHER".equals(role(auth)))throw new ForbiddenOperationException("Only teachers can generate questions with AI");}
}
