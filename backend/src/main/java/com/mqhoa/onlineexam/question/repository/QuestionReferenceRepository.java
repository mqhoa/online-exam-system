package com.mqhoa.onlineexam.question.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class QuestionReferenceRepository {
    private final JdbcTemplate jdbcTemplate;

    public QuestionReferenceRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean teacherGroupExists(Long id) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM teacher_groups WHERE id = ? AND enabled = TRUE)", Boolean.class, id));
    }

    public boolean teacherBelongsToGroup(Long teacherId, Long groupId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM teacher_group_members m " +
                        "JOIN users u ON u.id = m.teacher_id " +
                        "WHERE m.teacher_id = ? AND m.group_id = ? " +
                        "AND u.role = 'TEACHER' AND u.enabled = TRUE)",
                Boolean.class, teacherId, groupId));
    }
}
