package com.mqhoa.onlineexam.auth;

import com.mqhoa.onlineexam.auth.dto.LoginRequest;
import com.mqhoa.onlineexam.auth.dto.UserView;
import com.mqhoa.onlineexam.auth.service.AuthService;
import com.mqhoa.onlineexam.auth.service.PasswordRecoveryService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.web.csrf.CsrfToken;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService authService;
    private final PasswordRecoveryService passwordRecovery;
    private final HttpSessionSecurityContextRepository contextRepository = new HttpSessionSecurityContextRepository();

    public AuthController(AuthService authService, PasswordRecoveryService passwordRecovery) { this.authService = authService; this.passwordRecovery=passwordRecovery; }

    public record ForgotPasswordRequest(String email) {}
    public record ResetPasswordRequest(String token,String password) {}
    public record ChangePasswordRequest(String currentPassword,String newPassword) {}
    public record MessageResponse(String message) {}

    @PostMapping("/password/forgot")
    public MessageResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        passwordRecovery.requestReset(request.email());
        return new MessageResponse("If the email matches an account, a password reset link will be sent.");
    }

    @PostMapping("/password/reset")
    public MessageResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        passwordRecovery.resetPassword(request.token(),request.password());
        return new MessageResponse("Password updated. You can now sign in.");
    }

    @PostMapping("/password/change")
    public MessageResponse changePassword(@RequestBody ChangePasswordRequest request,Authentication authentication) {
        passwordRecovery.changePassword(authentication.getName(),request.currentPassword(),request.newPassword());
        return new MessageResponse("Password updated.");
    }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) { return Map.of("token", token.getToken()); }

    @PostMapping("/login")
    public Map<String, UserView> login(@RequestBody LoginRequest request, HttpServletRequest servletRequest,
                                       HttpServletResponse servletResponse) {
        try {
            Authentication authentication = authService.authenticate(request.username(), request.password());
            servletRequest.getSession(true);
            servletRequest.changeSessionId();
            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(authentication);
            SecurityContextHolder.setContext(context);
            contextRepository.saveContext(context, servletRequest, servletResponse);
            return Map.of("user", authService.findUser(authentication.getName()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
        }
    }

    @GetMapping("/me")
    public Map<String, UserView> me(Authentication authentication) {
        return Map.of("user", authService.findUser(authentication.getName()));
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletRequest request) {
        SecurityContextHolder.clearContext();
        HttpSession session = request.getSession(false);
        if (session != null) session.invalidate();
    }

}
