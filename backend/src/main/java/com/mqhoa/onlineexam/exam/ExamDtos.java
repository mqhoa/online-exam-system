package com.mqhoa.onlineexam.exam;

import com.mqhoa.onlineexam.question.QuestionType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class ExamDtos {
    private ExamDtos() {}
    public record QuestionPick(@Positive long questionId, @NotNull @DecimalMin("0.01") BigDecimal score) {}
    public record ExamRequest(@Positive long teacherGroupId, @NotBlank @Size(max=255) String title,
            String description, @NotNull Instant startTime, @NotNull Instant endTime,
            @Positive int durationMinutes, @NotBlank @Size(max=20) String pin,
            @NotEmpty @Size(max=200) List<@Valid QuestionPick> questions) {}
    public record AnswerRequest(@NotNull List<@Positive Long> optionIds, String answerText) {}
    public record OptionView(long id, String content, int position) {}
    public record ExamQuestionView(long id, int position, String content, QuestionType questionType,
            BigDecimal score, List<OptionView> options) {}
    public record ExamView(long id, long teacherGroupId, String title, String description,
            Instant startTime, Instant endTime, int durationMinutes, String status, String pin,
            int totalQuestionCount, BigDecimal totalPoints, List<ExamQuestionView> questions) {}
    public record SavedAnswer(long questionId, List<Long> optionIds, String answerText) {}
    public record AttemptView(long id, long examId, Instant deadline, String status,
            ExamView exam, List<SavedAnswer> answers) {}
    public record ResultView(long attemptId, long examId, String examTitle, long studentId,
            String studentUsername, String studentName, String status,
            Instant submittedAt, BigDecimal score, BigDecimal totalScore) {}
}
