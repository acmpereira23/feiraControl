package com.feiracontrol.backend.application.dashboard.exception;

public class InvalidDashboardDateRangeException extends RuntimeException {

    public InvalidDashboardDateRangeException() {
        super("Start date must be less than or equal to end date");
    }
}
