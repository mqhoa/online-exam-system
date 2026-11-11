package com.mqhoa.onlineexam.ai;

import com.mqhoa.onlineexam.ai.dto.AiGenerationDtos.*;
import com.mqhoa.onlineexam.ai.service.AiGenerationService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController @RequestMapping("/api/ai/generations")
public class AiGenerationController {
    private final AiGenerationService service;
    public AiGenerationController(AiGenerationService service){this.service=service;}
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.ACCEPTED)
    public JobView create(@RequestParam long teacherGroupId,@RequestParam String focusTopic,@RequestParam int questionCount,@RequestParam String difficulty,@RequestPart("file") MultipartFile file,Authentication auth){return service.create(teacherGroupId,file,focusTopic,questionCount,difficulty,auth);}
    @GetMapping("/{id}") public JobView get(@PathVariable long id,Authentication auth){return service.get(id,auth);}
    public record ApproveRequest(@NotEmpty List<@PositiveOrZero Integer> questionIndexes){}
    @PostMapping("/{id}/approve") public ApproveResponse approve(@PathVariable long id,@Valid @RequestBody ApproveRequest request,Authentication auth){return service.approve(id,request.questionIndexes(),auth);}
}
