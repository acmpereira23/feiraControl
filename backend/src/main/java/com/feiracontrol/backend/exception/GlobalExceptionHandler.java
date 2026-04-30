package com.feiracontrol.backend.exception;

import com.feiracontrol.backend.application.auth.exception.AuthEmailAlreadyInUseException;
import com.feiracontrol.backend.application.auth.exception.InvalidCredentialsException;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.cash.exception.InvalidCashMovementDateRangeException;
import com.feiracontrol.backend.application.cash.exception.InvalidFairLocationReferenceException;
import com.feiracontrol.backend.application.dashboard.exception.InvalidDashboardDateRangeException;
import com.feiracontrol.backend.application.employeepayment.exception.InvalidEmployeeReferenceException;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureDateRangeException;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureReferenceException;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(AuthEmailAlreadyInUseException.class)
    public ResponseEntity<ApiErrorResponse> handleEmailAlreadyInUse(AuthEmailAlreadyInUseException exception) {
        return buildResponse(HttpStatus.CONFLICT, "Conflict", exception.getMessage(), List.of());
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidCredentials(InvalidCredentialsException exception) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", exception.getMessage(), List.of());
    }

    @ExceptionHandler(UnauthenticatedAccessException.class)
    public ResponseEntity<ApiErrorResponse> handleUnauthenticatedAccess(UnauthenticatedAccessException exception) {
        return buildResponse(HttpStatus.UNAUTHORIZED, "Unauthorized", exception.getMessage(), List.of());
    }

    @ExceptionHandler({
        InvalidFairLocationReferenceException.class,
        InvalidCashMovementDateRangeException.class,
        InvalidDashboardDateRangeException.class,
        InvalidEmployeeReferenceException.class,
        InvalidFairLocationCashClosureDateRangeException.class,
        InvalidFairLocationCashClosureReferenceException.class
    })
    public ResponseEntity<ApiErrorResponse> handleBadRequest(RuntimeException exception) {
        return buildResponse(HttpStatus.BAD_REQUEST, "Bad request", exception.getMessage(), List.of());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpectedException(Exception exception) {
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Unexpected error", exception.getMessage(), List.of());
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
        MethodArgumentNotValidException exception,
        HttpHeaders headers,
        HttpStatusCode status,
        WebRequest request
    ) {
        List<String> details = exception.getBindingResult().getFieldErrors().stream()
            .map(this::formatFieldError)
            .toList();

        return ResponseEntity.badRequest()
            .body(new ApiErrorResponse(
                Instant.now(),
                HttpStatus.BAD_REQUEST.value(),
                "Validation error",
                "Request validation failed",
                details
            ));
    }

    private String formatFieldError(FieldError error) {
        return error.getField() + ": " + error.getDefaultMessage();
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(
        HttpStatus status,
        String error,
        String message,
        List<String> details
    ) {
        return ResponseEntity.status(status)
            .body(new ApiErrorResponse(
                Instant.now(),
                status.value(),
                error,
                message,
                details
            ));
    }
}
