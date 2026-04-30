package com.feiracontrol.backend.application.fairclosure.exception;

public class InvalidFairLocationCashClosureReferenceException extends IllegalArgumentException {

    public InvalidFairLocationCashClosureReferenceException() {
        super("Fair location not found");
    }
}
