package com.mqhoa.onlineexam.teacher_group.repository;

import com.mqhoa.onlineexam.teacher_group.dto.GroupView;
import java.util.List;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class TeacherGroupRepository {
    private final JdbcTemplate jdbc;

    public TeacherGroupRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public String findEnabledUserRole(String username) {
        return jdbc.queryForObject("SELECT role FROM users WHERE lower(username)=lower(?) AND enabled=TRUE", String.class, username);
    }

    public List<GroupView> findEnabledGroupsVisibleTo(String role, String username) {
        String sql = "SELECT g.id,g.name,s.code,s.name,(SELECT count(*) FROM teacher_group_members m WHERE m.group_id=g.id),"+
                "(SELECT count(*) FROM questions q WHERE q.teacher_group_id=g.id),(SELECT count(*) FROM exams e WHERE e.group_id=g.id) FROM teacher_groups g JOIN subjects s ON s.id=g.subject_id " +
                "WHERE g.enabled=TRUE AND (?='ADMIN' OR EXISTS(SELECT 1 FROM teacher_group_members m " +
                "JOIN users u ON u.id=m.teacher_id WHERE m.group_id=g.id AND lower(u.username)=lower(?))) ORDER BY s.code,g.name";
        return jdbc.query(sql, (rs, n) -> new GroupView(rs.getLong(1), rs.getString(2), rs.getString(3), rs.getString(4),rs.getInt(5),rs.getInt(6),rs.getInt(7),true), role, username);
    }

    public List<GroupView> findAllForAdmin(){return jdbc.query("SELECT g.id,g.name,s.code,s.name,(SELECT count(*) FROM teacher_group_members m WHERE m.group_id=g.id),(SELECT count(*) FROM questions q WHERE q.teacher_group_id=g.id),(SELECT count(*) FROM exams e WHERE e.group_id=g.id),g.enabled FROM teacher_groups g JOIN subjects s ON s.id=g.subject_id ORDER BY s.code,g.name",(rs,n)->new GroupView(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getInt(5),rs.getInt(6),rs.getInt(7),rs.getBoolean(8)));}

    public GroupView create(long subjectId,String name,String description) {
        Long id=jdbc.queryForObject("INSERT INTO teacher_groups(subject_id,name,description) VALUES (?,?,?) RETURNING id",Long.class,subjectId,name,description);
        return jdbc.queryForObject("SELECT g.id,g.name,s.code,s.name,(SELECT count(*) FROM teacher_group_members m WHERE m.group_id=g.id),(SELECT count(*) FROM questions q WHERE q.teacher_group_id=g.id),(SELECT count(*) FROM exams e WHERE e.group_id=g.id),g.enabled FROM teacher_groups g JOIN subjects s ON s.id=g.subject_id WHERE g.id=?",
                (rs,n)->new GroupView(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getInt(5),rs.getInt(6),rs.getInt(7),rs.getBoolean(8)),id);
    }
    public void setTeachers(long groupId,Set<Long> teacherIds) {
        jdbc.update("DELETE FROM teacher_group_members WHERE group_id=?",groupId);
        for(Long teacherId:teacherIds) jdbc.update("INSERT INTO teacher_group_members(group_id,teacher_id) SELECT ?,id FROM users WHERE id=? AND role='TEACHER' AND enabled=TRUE",groupId,teacherId);
    }
    public boolean exists(long groupId){return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM teacher_groups WHERE id=? AND enabled=TRUE)",Boolean.class,groupId));}
    public GroupView update(long id,long subjectId,String name,String description){
        Integer count=jdbc.update("UPDATE teacher_groups SET subject_id=?,name=?,description=? WHERE id=? AND enabled=TRUE",subjectId,name,description,id);
        if(count==0)return null;
        return jdbc.queryForObject("SELECT g.id,g.name,s.code,s.name,(SELECT count(*) FROM teacher_group_members m WHERE m.group_id=g.id),(SELECT count(*) FROM questions q WHERE q.teacher_group_id=g.id),(SELECT count(*) FROM exams e WHERE e.group_id=g.id),g.enabled FROM teacher_groups g JOIN subjects s ON s.id=g.subject_id WHERE g.id=?",(rs,n)->new GroupView(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getInt(5),rs.getInt(6),rs.getInt(7),rs.getBoolean(8)),id);
    }
    public boolean setEnabled(long id,boolean enabled){return jdbc.update("UPDATE teacher_groups SET enabled=? WHERE id=?",enabled,id)>0;}
    public int countTeachers(Set<Long> teacherIds){if(teacherIds.isEmpty())return 0;String marks=String.join(",",java.util.Collections.nCopies(teacherIds.size(),"?"));return jdbc.queryForObject("SELECT count(*) FROM users WHERE role='TEACHER' AND enabled=TRUE AND id IN ("+marks+")",Integer.class,teacherIds.toArray());}
    public Set<Long> teacherIds(long groupId){return new java.util.HashSet<>(jdbc.query("SELECT teacher_id FROM teacher_group_members WHERE group_id=? ORDER BY teacher_id",(rs,n)->rs.getLong(1),groupId));}
}
