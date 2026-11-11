package com.mqhoa.onlineexam.auth.service;

import com.mqhoa.onlineexam.auth.dto.UserView;
import com.mqhoa.onlineexam.auth.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository users;

    public AuthService(AuthenticationManager authenticationManager, UserRepository users) {
        this.authenticationManager = authenticationManager;
        this.users = users;
    }

    public Authentication authenticate(String username, String password) {
        return authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(username, password));
    }

    public UserView findUser(String username) { return users.findEnabledViewByUsername(username); }
}
