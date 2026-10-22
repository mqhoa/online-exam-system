package com.mqhoa.onlineexam.question.service;

import com.mqhoa.onlineexam.question.Question;
import com.mqhoa.onlineexam.question.QuestionOption;
import com.mqhoa.onlineexam.question.dto.QuestionOptionResponse;
import com.mqhoa.onlineexam.question.dto.QuestionResponse;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class QuestionMapper {
    public QuestionResponse toResponse(Question question, List<QuestionOption> options) {
        List<QuestionOptionResponse> optionResponses = options.stream()
                .map(option -> new QuestionOptionResponse(option.getId(), option.getContent(),
                        option.isCorrect(), option.getPosition()))
                .toList();
        return new QuestionResponse(question.getId(), question.getTeacherGroupId(), question.getCreatedBy(),
                question.getContent(), question.getQuestionType(), question.getCreatedAt(),
                question.getUpdatedAt(), optionResponses);
    }
}
