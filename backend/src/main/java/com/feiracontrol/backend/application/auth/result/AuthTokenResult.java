package com.feiracontrol.backend.application.auth.result;

public record AuthTokenResult(
    String accessToken,
    String tokenType,
    long expiresInSeconds,
    AuthSessionView session
) {
}
