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

    public boolean canManageGroup(String username, Long groupId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM users u WHERE lower(u.username)=lower(?) AND u.enabled=TRUE " +
                        "AND (u.role='ADMIN' OR (u.role='TEACHER' AND EXISTS (SELECT 1 FROM teacher_group_members m WHERE m.teacher_id=u.id AND m.group_id=?))))",
                Boolean.class, username, groupId));
    }

    public Long userId(String username) {
        return jdbcTemplate.queryForObject("SELECT id FROM users WHERE lower(username)=lower(?) AND enabled=TRUE", Long.class, username);
    }

    public boolean isLockedByPublishedExam(Long questionId) {
        return Boolean.TRUE.equals(jdbcTemplate.queryForObject(
                "SELECT EXISTS (SELECT 1 FROM exam_questions eq JOIN exams e ON e.id=eq.exam_id WHERE eq.question_id=? AND e.status IN ('PUBLISHED','CLOSED'))",
                Boolean.class, questionId));
    }
}
