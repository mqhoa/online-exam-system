package com.mqhoa.onlineexam.exam.repository;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/** SQL lookups shared by the exam business service. */
@Repository
public class ExamRepository {
    private final JdbcTemplate jdbc;

    public ExamRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public ActorRecord findEnabledActor(String username) {
        return jdbc.queryForObject("SELECT id, role FROM users WHERE lower(username)=lower(?) AND enabled=TRUE",
                (rs, n) -> new ActorRecord(rs.getLong(1), rs.getString(2)), username);
    }

    public boolean isTeacherGroupMember(long teacherId, long groupId) {
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "SELECT EXISTS(SELECT 1 FROM teacher_group_members WHERE teacher_id=? AND group_id=?)",
                Boolean.class, teacherId, groupId));
    }

    public boolean isPinLocked(long examId,long studentId){
        return Boolean.TRUE.equals(jdbc.queryForObject("SELECT EXISTS(SELECT 1 FROM exam_pin_attempts WHERE exam_id=? AND student_id=? AND locked_until>CURRENT_TIMESTAMP)",Boolean.class,examId,studentId));
    }
    @Transactional(propagation=Propagation.REQUIRES_NEW)
    public void recordFailedPin(long examId,long studentId){
        jdbc.update("INSERT INTO exam_pin_attempts(exam_id,student_id,failed_attempts) VALUES (?, ?, 1) " +
                "ON CONFLICT(exam_id,student_id) DO UPDATE SET " +
                "failed_attempts=CASE WHEN exam_pin_attempts.locked_until IS NOT NULL AND exam_pin_attempts.locked_until<=CURRENT_TIMESTAMP THEN 1 ELSE exam_pin_attempts.failed_attempts+1 END, " +
                "locked_until=CASE WHEN (CASE WHEN exam_pin_attempts.locked_until IS NOT NULL AND exam_pin_attempts.locked_until<=CURRENT_TIMESTAMP THEN 1 ELSE exam_pin_attempts.failed_attempts+1 END)>=5 THEN CURRENT_TIMESTAMP+INTERVAL '10 minutes' ELSE NULL END");
    }
    public void clearPinFailures(long examId,long studentId){jdbc.update("DELETE FROM exam_pin_attempts WHERE exam_id=? AND student_id=?",examId,studentId);}

    public record ActorRecord(long id, String role) {}
}
