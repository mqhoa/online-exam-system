package com.mqhoa.onlineexam.question.repository;

import com.mqhoa.onlineexam.question.Question;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuestionRepository extends JpaRepository<Question, Long> {
    List<Question> findByTeacherGroupIdOrderByCreatedAtDesc(Long teacherGroupId);
}
