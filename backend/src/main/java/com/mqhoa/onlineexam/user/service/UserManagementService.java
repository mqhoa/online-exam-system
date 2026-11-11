package com.mqhoa.onlineexam.user.service;

import com.mqhoa.onlineexam.common.ForbiddenOperationException;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import com.mqhoa.onlineexam.common.ResourceNotFoundException;
import com.mqhoa.onlineexam.user.dto.CreateUserRequest;
import com.mqhoa.onlineexam.user.dto.UserResponse;
import com.mqhoa.onlineexam.user.repository.UserManagementRepository;
import java.util.List;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserManagementService {
    private final JdbcTemplate jdbc; private final PasswordEncoder encoder; private final UserManagementRepository users;
    public UserManagementService(JdbcTemplate jdbc,PasswordEncoder encoder,UserManagementRepository users){this.jdbc=jdbc;this.encoder=encoder;this.users=users;}
    private void requireAdmin(Authentication auth){ if(auth.getAuthorities().stream().noneMatch(a->a.getAuthority().equals("ROLE_ADMIN"))) throw new ForbiddenOperationException("Only administrators can manage accounts"); }
    public List<UserResponse> list(Authentication auth){requireAdmin(auth);return users.findAll();}
    @Transactional public UserResponse create(CreateUserRequest r,Authentication auth){requireAdmin(auth);String username=r.username().trim();if(username.isBlank()||"ADMIN".equals(r.role()))throw new InvalidRequestException("Only TEACHER or STUDENT accounts can be created");return users.create(username,encoder.encode(r.password()),r.fullName().trim(),r.email()==null?null:r.email().trim(),r.role());}
    @Transactional public UserResponse setEnabled(long id,boolean enabled,Authentication auth){requireAdmin(auth);UserResponse result=users.setEnabled(id,enabled);if(result==null)throw new ResourceNotFoundException("User",id);return result;}
    @Transactional public void resetPassword(long id,String password,Authentication auth){requireAdmin(auth);if(password==null||password.length()<8)throw new InvalidRequestException("Password must contain at least 8 characters");Integer count=jdbc.queryForObject("SELECT count(*) FROM users WHERE id=? AND role<>'ADMIN'",Integer.class,id);if(count==null||count==0)throw new ResourceNotFoundException("User",id);users.changePassword(id,encoder.encode(password));}
}
