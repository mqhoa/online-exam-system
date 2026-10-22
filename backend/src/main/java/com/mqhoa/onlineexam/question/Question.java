package com.mqhoa.onlineexam.question;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "questions")
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "teacher_group_id", nullable = false)
    private Long teacherGroupId;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false, length = 30)
    private QuestionType questionType;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected Question() {}

    public static Question create(Long teacherGroupId, Long createdBy, String content, QuestionType questionType) {
        Question question = new Question();
        question.teacherGroupId = teacherGroupId;
        question.createdBy = createdBy;
        question.content = content;
        question.questionType = questionType;
        question.createdAt = Instant.now();
        question.updatedAt = question.createdAt;
        return question;
    }

    public void update(String content, QuestionType questionType) {
        this.content = content;
        this.questionType = questionType;
        this.updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getTeacherGroupId() { return teacherGroupId; }
    public Long getCreatedBy() { return createdBy; }
    public String getContent() { return content; }
    public QuestionType getQuestionType() { return questionType; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
