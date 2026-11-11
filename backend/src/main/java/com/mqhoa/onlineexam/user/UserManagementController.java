package com.mqhoa.onlineexam.user;

import com.mqhoa.onlineexam.user.dto.CreateUserRequest;
import com.mqhoa.onlineexam.user.dto.UserResponse;
import com.mqhoa.onlineexam.user.service.UserManagementService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import com.mqhoa.onlineexam.user.service.StudentRosterService;
import java.nio.charset.StandardCharsets;

@RestController @RequestMapping("/api/users")
public class UserManagementController {
    private final UserManagementService service;
    private final StudentRosterService roster;
    public UserManagementController(UserManagementService service,StudentRosterService roster){this.service=service;this.roster=roster;}
    @GetMapping public List<UserResponse> list(Authentication auth){return service.list(auth);}
    @GetMapping("/students") public List<StudentRosterService.StudentRow> students(Authentication auth){return roster.list(auth);}
    @PostMapping("/students") @ResponseStatus(HttpStatus.CREATED) public StudentRosterService.CreatedStudent createStudent(@RequestBody StudentRosterService.StudentProfile profile,Authentication auth){return roster.create(profile,auth);}
    @PutMapping("/students/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void updateStudent(@PathVariable long id,@RequestBody StudentRosterService.StudentProfile profile,Authentication auth){roster.update(id,profile,auth);}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public UserResponse create(@Valid @RequestBody CreateUserRequest request,Authentication auth){return service.create(request,auth);}
    public record EnabledRequest(boolean enabled){}
    public record PasswordRequest(String password){}
    @PatchMapping("/{id}/status") public UserResponse status(@PathVariable long id,@RequestBody EnabledRequest request,Authentication auth){return service.setEnabled(id,request.enabled(),auth);}
    @PatchMapping("/{id}/password") @ResponseStatus(HttpStatus.NO_CONTENT) public void password(@PathVariable long id,@RequestBody PasswordRequest request,Authentication auth){service.resetPassword(id,request.password(),auth);}
    @PostMapping(value="/import/students/preview",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public List<StudentRosterService.ImportRow> previewStudents(@RequestPart("file") MultipartFile file,Authentication auth){return roster.preview(file,auth);}
    @PostMapping(value="/import/students",consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public StudentRosterService.ImportResult importStudents(@RequestPart("file") MultipartFile file,Authentication auth){return roster.importWorkbook(file,auth);}
    @GetMapping("/import/students/template") public ResponseEntity<byte[]> studentTemplate(){return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename*=UTF-8''student-import-template.xlsx").contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")).body(roster.template());}
}
