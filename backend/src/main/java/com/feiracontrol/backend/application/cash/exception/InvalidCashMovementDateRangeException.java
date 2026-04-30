package com.feiracontrol.backend.application.cash.exception;

public class InvalidCashMovementDateRangeException extends RuntimeException {

    public InvalidCashMovementDateRangeException() {
        super("Start date must be less than or equal to end date");
    }
}
