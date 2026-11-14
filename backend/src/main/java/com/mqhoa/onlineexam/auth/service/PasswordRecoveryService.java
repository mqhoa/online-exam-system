package com.mqhoa.onlineexam.auth.service;

import com.mqhoa.onlineexam.auth.repository.UserRepository;
import com.mqhoa.onlineexam.common.InvalidRequestException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.net.URLEncoder;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PasswordRecoveryService {
    private static final Logger log=LoggerFactory.getLogger(PasswordRecoveryService.class);
    private static final SecureRandom RANDOM = new SecureRandom();
    private final JdbcTemplate jdbc;
    private final PasswordEncoder passwords;
    private final UserRepository users;
    private final ObjectProvider<JavaMailSender> mailSenders;
    private final boolean mailEnabled;
    private final String from;
    private final String frontendBaseUrl;

    public PasswordRecoveryService(JdbcTemplate jdbc, PasswordEncoder passwords, UserRepository users,
            ObjectProvider<JavaMailSender> mailSenders,
            @Value("${app.mail.enabled:false}") boolean mailEnabled,
            @Value("${app.mail.from:no-reply@localhost}") String from,
            @Value("${app.frontend-base-url:http://localhost:5173}") String frontendBaseUrl) {
        this.jdbc=jdbc;this.passwords=passwords;this.users=users;this.mailSenders=mailSenders;
        this.mailEnabled=mailEnabled;this.from=from;this.frontendBaseUrl=frontendBaseUrl;
    }

    @Transactional
    public void requestReset(String rawEmail) {
        if (!mailEnabled || mailSenders.getIfAvailable()==null)
            throw new InvalidRequestException("Email password recovery is not configured. Contact your administrator.");
        if (rawEmail==null || rawEmail.isBlank()) return;
        List<Long> ids=jdbc.query("SELECT id FROM users WHERE lower(email)=lower(?) AND enabled=TRUE",(rs,n)->rs.getLong(1),rawEmail.trim());
        if(ids.size()!=1)return;
        long userId=ids.get(0);
        Integer recent=jdbc.queryForObject("SELECT count(*) FROM password_reset_tokens WHERE user_id=? AND created_at>now()-interval '60 seconds'",Integer.class,userId);
        if(recent!=null&&recent>0)return;

        jdbc.update("DELETE FROM password_reset_tokens WHERE user_id=?",userId);
        byte[] bytes=new byte[32];RANDOM.nextBytes(bytes);
        String token=Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        String tokenHash=sha256(token);
        jdbc.update("INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES (?,?,now()+interval '30 minutes')",userId,tokenHash);
        String email=jdbc.queryForObject("SELECT email FROM users WHERE id=?",String.class,userId);
        String link=frontendBaseUrl.replaceAll("/$","")+"/login?resetToken="+URLEncoder.encode(token,StandardCharsets.UTF_8);
        SimpleMailMessage message=new SimpleMailMessage();message.setFrom(from);message.setTo(email);
        message.setSubject("Đặt lại mật khẩu Thi.Online");
        message.setText("Bạn đã yêu cầu đặt lại mật khẩu. Liên kết chỉ dùng một lần và hết hạn sau 30 phút:\n\n"+link+"\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.");
        try { mailSenders.getObject().send(message); }
        catch(MailException ex){jdbc.update("DELETE FROM password_reset_tokens WHERE token_hash=?",tokenHash);log.warn("Password recovery email could not be sent; SMTP configuration should be checked.");}
    }

    @Transactional
    public void resetPassword(String token,String newPassword) {
        validateNewPassword(newPassword);
        if(token==null||token.isBlank())throw new InvalidRequestException("Reset link is invalid or expired");
        String hash=sha256(token);
        Long userId;
        try { userId=jdbc.queryForObject("SELECT user_id FROM password_reset_tokens WHERE token_hash=? AND used_at IS NULL AND expires_at>now() FOR UPDATE",Long.class,hash); }
        catch(EmptyResultDataAccessException ex){throw new InvalidRequestException("Reset link is invalid or expired");}
        jdbc.update("UPDATE users SET password_hash=? WHERE id=?",passwords.encode(newPassword),userId);
        jdbc.update("UPDATE password_reset_tokens SET used_at=now() WHERE token_hash=?",hash);
        jdbc.update("DELETE FROM password_reset_tokens WHERE user_id=? AND token_hash<>?",userId,hash);
    }

    @Transactional
    public void changePassword(String username,String currentPassword,String newPassword) {
        validateNewPassword(newPassword);
        if(currentPassword==null||currentPassword.isBlank())throw new InvalidRequestException("Current password is required");
        UserDetails user=users.loadUserByUsername(username);
        if(!passwords.matches(currentPassword,user.getPassword()))throw new InvalidRequestException("Current password is incorrect");
        if(passwords.matches(newPassword,user.getPassword()))throw new InvalidRequestException("New password must be different from the current password");
        jdbc.update("UPDATE users SET password_hash=? WHERE lower(username)=lower(?)",passwords.encode(newPassword),username);
    }

    private void validateNewPassword(String password) {
        if(password==null||password.length()<8||password.length()>100)throw new InvalidRequestException("Password must contain between 8 and 100 characters");
    }

    private String sha256(String value) {
        try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
        catch(Exception ex){throw new IllegalStateException("SHA-256 is unavailable",ex);}
    }
}
