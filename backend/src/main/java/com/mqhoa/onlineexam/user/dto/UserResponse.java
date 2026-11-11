package com.mqhoa.onlineexam.user.dto;

import java.time.Instant;

public record UserResponse(long id, String username, String fullName, String email,
                           String role, boolean enabled, Instant createdAt) {}
