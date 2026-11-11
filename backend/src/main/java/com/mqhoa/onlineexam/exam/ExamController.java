package com.mqhoa.onlineexam.exam;

import static com.mqhoa.onlineexam.exam.dto.ExamDtos.*;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/api")
public class ExamController {
    private final ExamService service;
    public ExamController(ExamService service) { this.service=service; }

    @GetMapping("/exams")
    public List<ExamView> list(@RequestParam(required=false) Long teacherGroupId, Authentication auth) { return service.list(teacherGroupId,auth); }
    @PostMapping("/exams")
    @ResponseStatus(HttpStatus.CREATED)
    public ExamView create(@Valid @RequestBody ExamRequest request,Authentication auth) { return service.create(request,auth); }
    @GetMapping("/exams/{id}")
    public ExamView get(@PathVariable long id,Authentication auth) { return service.get(id,auth); }
    @PutMapping("/exams/{id}")
    public ExamView update(@PathVariable long id,@Valid @RequestBody ExamRequest request,Authentication auth) { return service.update(id,request,auth); }
    @PostMapping("/exams/{id}/publish")
    public ExamView publish(@PathVariable long id,Authentication auth) { return service.changeStatus(id,"PUBLISHED",auth); }
    @PostMapping("/exams/{id}/close")
    public ExamView close(@PathVariable long id,Authentication auth) { return service.changeStatus(id,"CLOSED",auth); }
    @PostMapping("/exams/{id}/attempts")
    public AttemptView start(@PathVariable long id,@RequestBody PinRequest request,Authentication auth) { return service.start(id,request.pin(),auth); }
    @GetMapping("/attempts/{id}")
    public AttemptView attempt(@PathVariable long id,Authentication auth) { return service.getAttempt(id,auth); }
    @PutMapping("/attempts/{id}/answers/{questionId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void save(@PathVariable long id,@PathVariable long questionId,@Valid @RequestBody AnswerRequest request,Authentication auth) { service.saveAnswer(id,questionId,request,auth); }
    @PostMapping("/attempts/{id}/submit")
    public ResultView submit(@PathVariable long id,Authentication auth) { return service.submit(id,auth); }
    @GetMapping("/attempts/{id}/result")
    public ResultView result(@PathVariable long id,Authentication auth) { return service.result(id,auth); }
    @GetMapping("/attempts/mine")
    public List<ResultView> myResults(Authentication auth) { return service.myResults(auth); }
    @GetMapping("/exams/{id}/results")
    public List<ResultView> results(@PathVariable long id,Authentication auth) { return service.results(id,auth); }
}
