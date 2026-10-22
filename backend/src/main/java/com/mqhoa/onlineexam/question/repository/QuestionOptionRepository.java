package com.mqhoa.onlineexam.question.repository;

import com.mqhoa.onlineexam.question.QuestionOption;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {
    List<QuestionOption> findByQuestionIdInOrderByQuestionIdAscPositionAsc(List<Long> questionIds);
    List<QuestionOption> findByQuestionIdOrderByPositionAsc(Long questionId);
}
