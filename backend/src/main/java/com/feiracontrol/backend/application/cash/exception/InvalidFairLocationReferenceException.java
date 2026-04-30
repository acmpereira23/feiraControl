package com.feiracontrol.backend.application.cash.exception;

public class InvalidFairLocationReferenceException extends RuntimeException {

    public InvalidFairLocationReferenceException() {
        super("Fair location is invalid for the authenticated business");
    }
}
