package com.mqhoa.onlineexam.ai.repository;

import java.sql.Timestamp;
import java.util.Optional;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class AiGenerationRepository {
    private final JdbcTemplate jdbc;
    public AiGenerationRepository(JdbcTemplate jdbc){this.jdbc=jdbc;}
    public long create(long teacherId,long groupId,String path,String filename){return jdbc.queryForObject("INSERT INTO ai_generation_jobs(teacher_id,group_id,file_path,original_filename,status) VALUES (?,?,?,?,'PENDING') RETURNING id",Long.class,teacherId,groupId,path,filename);}
    public Optional<JobRecord> find(long id){return jdbc.query("SELECT id,teacher_id,group_id,file_path,status,result,error_message,created_at FROM ai_generation_jobs WHERE id=?",rs->rs.next()?Optional.of(new JobRecord(rs.getLong(1),rs.getLong(2),rs.getLong(3),rs.getString(4),rs.getString(5),rs.getString(6),rs.getString(7),rs.getTimestamp(8).toInstant())):Optional.empty(),id);}
    public void markProcessing(long id){jdbc.update("UPDATE ai_generation_jobs SET status='PROCESSING' WHERE id=? AND status='PENDING'",id);}
    public void complete(long id,String result){jdbc.update("UPDATE ai_generation_jobs SET status='COMPLETED',result=?,completed_at=CURRENT_TIMESTAMP,error_message=NULL WHERE id=?",result,id);}
    public void fail(long id,String message){jdbc.update("UPDATE ai_generation_jobs SET status='FAILED',error_message=?,completed_at=CURRENT_TIMESTAMP WHERE id=?",message,id);}
    public record JobRecord(long id,long teacherId,long groupId,String filePath,String status,String result,String errorMessage,java.time.Instant createdAt){}
}
