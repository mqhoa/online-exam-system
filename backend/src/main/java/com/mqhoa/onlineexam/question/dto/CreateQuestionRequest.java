package com.mqhoa.onlineexam.question.dto;

import com.mqhoa.onlineexam.question.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateQuestionRequest(
        @Positive @NotNull Long teacherGroupId,
        @Positive @NotNull Long createdBy,
        @NotBlank @Size(max = 10000) String content,
        @NotNull QuestionType questionType,
        @NotEmpty @Size(max = 100) List<@Valid QuestionOptionRequest> options) {}
