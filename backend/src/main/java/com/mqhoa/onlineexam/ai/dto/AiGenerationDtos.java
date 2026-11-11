package com.mqhoa.onlineexam.ai.dto;

import com.mqhoa.onlineexam.question.QuestionType;
import java.time.Instant;
import java.util.List;

public final class AiGenerationDtos {
    private AiGenerationDtos(){}
    public record GeneratedOption(String content,boolean correct){}
    public record GeneratedQuestion(String content,QuestionType questionType,String explanation,List<GeneratedOption> options){}
    public record JobView(long id,long teacherGroupId,String status,String errorMessage,Instant createdAt,List<GeneratedQuestion> questions){}
    public record ApproveRequest(List<Integer> questionIndexes){}
    public record ApproveResponse(int savedCount){}
}
