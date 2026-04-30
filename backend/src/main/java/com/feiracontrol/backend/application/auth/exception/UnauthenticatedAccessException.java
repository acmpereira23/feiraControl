package com.feiracontrol.backend.application.auth.exception;

public class UnauthenticatedAccessException extends RuntimeException {

    public UnauthenticatedAccessException() {
        super("Authentication required");
    }
}
