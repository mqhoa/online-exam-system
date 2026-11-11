package com.mqhoa.onlineexam.auth.repository;

import com.mqhoa.onlineexam.auth.dto.UserView;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository implements UserDetailsService {
    private final JdbcTemplate jdbc;

    public UserRepository(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return jdbc.query("SELECT username, password_hash, role, enabled FROM users WHERE lower(username)=lower(?)",
                rs -> {
                    if (!rs.next()) throw new UsernameNotFoundException("Invalid username or password");
                    return User.withUsername(rs.getString("username"))
                            .password(rs.getString("password_hash"))
                            .roles(rs.getString("role"))
                            .disabled(!rs.getBoolean("enabled")).build();
                }, username);
    }

    public UserView findEnabledViewByUsername(String username) {
        return jdbc.queryForObject("SELECT id, username, full_name, role FROM users WHERE lower(username)=lower(?) AND enabled=TRUE",
                (rs, row) -> new UserView(rs.getLong("id"), rs.getString("username"),
                        rs.getString("full_name"), rs.getString("role")), username);
    }
}
