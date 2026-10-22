package com.mqhoa.onlineexam.question;

import jakarta.persistence.*;

@Entity
@Table(name = "options", uniqueConstraints =
        @UniqueConstraint(name = "uq_options_question_order", columnNames = {"question_id", "option_order"}))
public class QuestionOption {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "question_id", nullable = false)
    private Long questionId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_correct", nullable = false)
    private boolean correct;

    @Column(name = "option_order", nullable = false)
    private int position;

    protected QuestionOption() {}

    public static QuestionOption create(Long questionId, String content, boolean correct, int position) {
        QuestionOption option = new QuestionOption();
        option.questionId = questionId;
        option.content = content;
        option.correct = correct;
        option.position = position;
        return option;
    }

    public Long getId() { return id; }
    public Long getQuestionId() { return questionId; }
    public String getContent() { return content; }
    public boolean isCorrect() { return correct; }
    public int getPosition() { return position; }
}
