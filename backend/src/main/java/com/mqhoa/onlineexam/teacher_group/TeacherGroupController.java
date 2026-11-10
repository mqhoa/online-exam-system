package com.mqhoa.onlineexam.teacher_group;

import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/teacher-groups")
public class TeacherGroupController {
    private final JdbcTemplate jdbc;
    public TeacherGroupController(JdbcTemplate jdbc) { this.jdbc=jdbc; }
    public record GroupView(long id,String name,String subjectCode,String subjectName) {}
    @GetMapping
    public List<GroupView> list(Authentication authentication) {
        String role=jdbc.queryForObject("SELECT role FROM users WHERE lower(username)=lower(?) AND enabled=TRUE",String.class,authentication.getName());
        if (!"TEACHER".equals(role) && !"ADMIN".equals(role)) throw new ForbiddenOperationException("Only teachers and administrators can list teacher groups");
        String sql="SELECT g.id,g.name,s.code,s.name FROM teacher_groups g JOIN subjects s ON s.id=g.subject_id WHERE g.enabled=TRUE AND (?='ADMIN' OR EXISTS(SELECT 1 FROM teacher_group_members m JOIN users u ON u.id=m.teacher_id WHERE m.group_id=g.id AND lower(u.username)=lower(?))) ORDER BY s.code,g.name";
        return jdbc.query(sql,(rs,n)->new GroupView(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4)),role,authentication.getName());
    }
}
