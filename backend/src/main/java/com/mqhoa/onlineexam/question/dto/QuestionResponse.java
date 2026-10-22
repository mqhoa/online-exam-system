package com.mqhoa.onlineexam.question.dto;

import com.mqhoa.onlineexam.question.QuestionType;
import java.time.Instant;
import java.util.List;

public record QuestionResponse(Long id, Long teacherGroupId, Long createdBy, String content,
                               QuestionType questionType, Instant createdAt, Instant updatedAt,
                               List<QuestionOptionResponse> options) {}
