package com.feiracontrol.backend.application.auth.exception;

public class AuthEmailAlreadyInUseException extends RuntimeException {

    public AuthEmailAlreadyInUseException(String email) {
        super("Email already in use: " + email);
    }
}
