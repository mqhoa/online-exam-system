package com.mqhoa.onlineexam.question.controller;

import com.mqhoa.onlineexam.question.service.QuestionExcelService;
import java.nio.charset.StandardCharsets;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/questions")
public class QuestionExcelController {
    private final QuestionExcelService service;
    public QuestionExcelController(QuestionExcelService service){this.service=service;}
    @PostMapping(value="/import",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ImportResponse importQuestions(@RequestParam long teacherGroupId,@RequestPart("file") MultipartFile file,Authentication auth){return new ImportResponse(service.importWorkbook(teacherGroupId,auth.getName(),file));}
    @GetMapping("/export") public ResponseEntity<byte[]> export(@RequestParam long teacherGroupId,Authentication auth){return workbook("questions-group-"+teacherGroupId+".xlsx",service.exportWorkbook(teacherGroupId,auth.getName()));}
    @GetMapping("/template") public ResponseEntity<byte[]> template(){return workbook("question-import-template.xlsx",service.template());}
    private ResponseEntity<byte[]> workbook(String name,byte[] bytes){return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename*=UTF-8''"+java.net.URLEncoder.encode(name,StandardCharsets.UTF_8)).contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(bytes);}
    public record ImportResponse(int importedCount){}
}
