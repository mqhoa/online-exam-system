package com.mqhoa.onlineexam.question.controller;

import com.mqhoa.onlineexam.question.service.QuestionService;
import com.mqhoa.onlineexam.question.dto.CreateQuestionRequest;
import com.mqhoa.onlineexam.question.dto.QuestionResponse;
import com.mqhoa.onlineexam.question.dto.UpdateQuestionRequest;
import java.util.List;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/questions")
public class QuestionController {
    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) { this.questionService = questionService; }

    @GetMapping
    public List<QuestionResponse> getByTeacherGroup(@RequestParam @Positive Long teacherGroupId) {
        return questionService.listByTeacherGroup(teacherGroupId);
    }

    @GetMapping("/{questionId}")
    public QuestionResponse get(@PathVariable @Positive Long questionId) {
        return questionService.get(questionId);
    }

    @PostMapping
    public ResponseEntity<QuestionResponse> create(@Valid @RequestBody CreateQuestionRequest request) {
        QuestionResponse response = questionService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{questionId}")
    public QuestionResponse update(@PathVariable @Positive Long questionId,
                                   @Valid @RequestBody UpdateQuestionRequest request) {
        return questionService.update(questionId, request);
    }

    @DeleteMapping("/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable @Positive Long questionId) {
        questionService.delete(questionId);
    }
}
