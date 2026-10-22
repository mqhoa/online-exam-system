package com.mqhoa.onlineexam.question.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record QuestionOptionRequest(
        @NotBlank @Size(max = 2000) String content,
        @NotNull Boolean correct) {}
