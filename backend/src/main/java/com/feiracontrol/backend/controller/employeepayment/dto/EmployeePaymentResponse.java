package com.feiracontrol.backend.controller.employeepayment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeePaymentResponse(
    UUID id,
    UUID employeeId,
    UUID cashMovementId,
    BigDecimal amount,
    LocalDate paidOn,
    String notes,
    Instant createdAt
) {
}
