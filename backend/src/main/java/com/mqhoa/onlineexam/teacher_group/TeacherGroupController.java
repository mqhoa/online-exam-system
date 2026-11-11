package com.mqhoa.onlineexam.teacher_group;

import com.mqhoa.onlineexam.teacher_group.dto.GroupView;
import com.mqhoa.onlineexam.teacher_group.service.TeacherGroupService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import java.util.Set;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/teacher-groups")
public class TeacherGroupController {
    private final TeacherGroupService service;

    public TeacherGroupController(TeacherGroupService service) { this.service = service; }

    @GetMapping
    public List<GroupView> list(@RequestParam(defaultValue="false") boolean all,Authentication authentication) {
        if(all)return service.listAllForAdmin(authentication);
        return service.listFor(authentication.getName());
    }
    public record CreateGroupRequest(long subjectId,String name,String description){}
    public record TeacherMembersRequest(Set<Long> teacherIds){}
    public record GroupStatusRequest(boolean enabled){}
    @PostMapping @ResponseStatus(HttpStatus.CREATED) public GroupView create(@RequestBody CreateGroupRequest request,Authentication auth){return service.create(request.subjectId(),request.name(),request.description(),auth);}
    @PutMapping("/{id}/teachers") @ResponseStatus(HttpStatus.NO_CONTENT) public void teachers(@PathVariable long id,@RequestBody TeacherMembersRequest request,Authentication auth){service.assignTeachers(id,request.teacherIds()==null?Set.of():request.teacherIds(),auth);}
    @GetMapping("/{id}/teachers") public Set<Long> teacherIds(@PathVariable long id,Authentication auth){return service.teacherIds(id,auth);}
    @PutMapping("/{id}") public GroupView update(@PathVariable long id,@RequestBody CreateGroupRequest request,Authentication auth){return service.update(id,request.subjectId(),request.name(),request.description(),auth);}
    @PatchMapping("/{id}/status") @ResponseStatus(HttpStatus.NO_CONTENT) public void status(@PathVariable long id,@RequestBody GroupStatusRequest request,Authentication auth){service.setEnabled(id,request.enabled(),auth);}
}
