package com.feiracontrol.backend.controller.auth.dto;

public record AuthResponse(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    SessionResponse session
) {
}
