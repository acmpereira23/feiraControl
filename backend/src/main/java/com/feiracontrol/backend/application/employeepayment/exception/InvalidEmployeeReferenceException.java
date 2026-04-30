package com.feiracontrol.backend.application.employeepayment.exception;

public class InvalidEmployeeReferenceException extends RuntimeException {

    public InvalidEmployeeReferenceException() {
        super("Employee not found");
    }
}
