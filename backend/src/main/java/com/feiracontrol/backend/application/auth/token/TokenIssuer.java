package com.feiracontrol.backend.application.auth.token;

public interface TokenIssuer {

    String issue(TokenPayload payload);

    long expiresInSeconds();
}
