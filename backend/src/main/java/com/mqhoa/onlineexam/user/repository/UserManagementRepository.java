package com.mqhoa.onlineexam.user.repository;

import com.mqhoa.onlineexam.user.dto.UserResponse;
import java.sql.Timestamp;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserManagementRepository {
    private final JdbcTemplate jdbc;
    public UserManagementRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public List<UserResponse> findAll() {
        return jdbc.query("SELECT id,username,full_name,email,role,enabled,created_at FROM users ORDER BY id",
                (rs,n) -> new UserResponse(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getBoolean(6),rs.getTimestamp(7).toInstant()));
    }
    public UserResponse create(String username,String hash,String name,String email,String role) {
        return jdbc.queryForObject("INSERT INTO users(username,password_hash,full_name,email,role) VALUES (?,?,?,?,?) RETURNING id,username,full_name,email,role,enabled,created_at",
                (rs,n) -> new UserResponse(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getBoolean(6),rs.getTimestamp(7).toInstant()),username,hash,name,email,role);
    }
    public UserResponse setEnabled(long id,boolean enabled) {
        return jdbc.query("UPDATE users SET enabled=? WHERE id=? AND role<>'ADMIN' RETURNING id,username,full_name,email,role,enabled,created_at",
                rs -> rs.next() ? new UserResponse(rs.getLong(1),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5),rs.getBoolean(6),rs.getTimestamp(7).toInstant()) : null,enabled,id);
    }
    public void changePassword(long id,String hash) { jdbc.update("UPDATE users SET password_hash=? WHERE id=? AND role<>'ADMIN'",hash,id); }
}
