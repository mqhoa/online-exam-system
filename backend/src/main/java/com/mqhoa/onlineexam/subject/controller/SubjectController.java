package com.mqhoa.onlineexam.subject.controller;

import com.mqhoa.onlineexam.subject.Subject;
import com.mqhoa.onlineexam.subject.service.SubjectService;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectService subjectService;

    public SubjectController(SubjectService subjectService) {
        this.subjectService = subjectService;
    }

    @GetMapping
    public List<Subject> getAllSubjects() {
        return subjectService.getAllSubjects();
    }

    public record CreateSubjectRequest(
            @NotBlank @Size(max = 50) String code,
            @NotBlank @Size(max = 200) String name,
            String description) {}

    @PostMapping
    @ResponseStatus(org.springframework.http.HttpStatus.CREATED)
    public Subject createSubject(@Valid @RequestBody CreateSubjectRequest request) {
        return subjectService.createSubject(request.code().trim(), request.name().trim(), request.description());
    }
}
