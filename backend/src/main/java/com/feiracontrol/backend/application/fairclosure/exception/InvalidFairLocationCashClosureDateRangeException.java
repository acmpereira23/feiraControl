package com.feiracontrol.backend.application.fairclosure.exception;

public class InvalidFairLocationCashClosureDateRangeException extends IllegalArgumentException {

    public InvalidFairLocationCashClosureDateRangeException() {
        super("Start date must be before or equal to end date");
    }
}
