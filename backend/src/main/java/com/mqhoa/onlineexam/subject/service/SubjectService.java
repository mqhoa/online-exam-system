package com.mqhoa.onlineexam.subject.service;

import com.mqhoa.onlineexam.subject.Subject;
import com.mqhoa.onlineexam.subject.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import com.mqhoa.onlineexam.common.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;

    public SubjectService(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    public List<Subject> getAllSubjects() {
        return subjectRepository.findAllByOrderByIdAsc();
    }

    public Subject createSubject(String code, String name, String description) {
        if (subjectRepository.existsByCodeIgnoreCase(code)) {
            throw new IllegalArgumentException("Subject code already exists");
        }
        try {
            return subjectRepository.save(Subject.create(code, name, description));
        } catch (DataIntegrityViolationException exception) {
            throw new IllegalArgumentException("Subject code already exists", exception);
        }
    }

    public Subject updateSubject(long id,String code,String name,String description){
        Subject subject=subjectRepository.findById(id).orElseThrow(()->new ResourceNotFoundException("Subject",id));
        if(subjectRepository.existsByCodeIgnoreCase(code) && !subject.getCode().equalsIgnoreCase(code)) throw new IllegalArgumentException("Subject code already exists");
        subject.update(code,name,description);
        return subjectRepository.save(subject);
    }
}
