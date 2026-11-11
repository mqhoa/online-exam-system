package com.mqhoa.onlineexam.teacher_group.service;

import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.teacher_group.dto.GroupView;
import com.mqhoa.onlineexam.teacher_group.repository.TeacherGroupRepository;
import java.util.List;
import java.util.Set;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

@Service
public class TeacherGroupService {
    private final TeacherGroupRepository groups;

    public TeacherGroupService(TeacherGroupRepository groups) { this.groups = groups; }

    public List<GroupView> listFor(String username) {
        String role = groups.findEnabledUserRole(username);
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role))
            throw new ForbiddenOperationException("Only teachers and administrators can list teacher groups");
        return groups.findEnabledGroupsVisibleTo(role, username);
    }
    public List<GroupView> listAllForAdmin(Authentication auth){requireAdmin(auth);return groups.findAllForAdmin();}

    @Transactional public GroupView create(long subjectId,String name,String description,Authentication auth){requireAdmin(auth);if(name==null||name.isBlank())throw new InvalidRequestException("Group name is required");return groups.create(subjectId,name.trim(),description);}
    @Transactional public GroupView update(long id,long subjectId,String name,String description,Authentication auth){requireAdmin(auth);if(name==null||name.isBlank())throw new InvalidRequestException("Group name is required");GroupView result=groups.update(id,subjectId,name.trim(),description);if(result==null)throw new com.mqhoa.onlineexam.common.ResourceNotFoundException("Teacher group",id);return result;}
    @Transactional public void setEnabled(long id,boolean enabled,Authentication auth){requireAdmin(auth);if(!groups.setEnabled(id,enabled))throw new com.mqhoa.onlineexam.common.ResourceNotFoundException("Teacher group",id);}
    @Transactional public void assignTeachers(long groupId,Set<Long> teacherIds,Authentication auth){requireAdmin(auth);if(!groups.exists(groupId))throw new com.mqhoa.onlineexam.common.ResourceNotFoundException("Teacher group",groupId);if(groups.countTeachers(teacherIds)!=teacherIds.size())throw new InvalidRequestException("Every assigned account must be an active teacher");groups.setTeachers(groupId,teacherIds);}
    public Set<Long> teacherIds(long groupId,Authentication auth){requireAdmin(auth);if(!groups.exists(groupId))throw new com.mqhoa.onlineexam.common.ResourceNotFoundException("Teacher group",groupId);return groups.teacherIds(groupId);}
    private void requireAdmin(Authentication auth){if(auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_ADMIN")))throw new ForbiddenOperationException("Only administrators can manage teacher groups");}
}
