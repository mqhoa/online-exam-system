package com.mqhoa.onlineexam.subject.repository;

import com.mqhoa.onlineexam.subject.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SubjectRepository
        extends JpaRepository<Subject, Long> {
    java.util.List<Subject> findAllByOrderByIdAsc();
    boolean existsByCodeIgnoreCase(String code);
}
