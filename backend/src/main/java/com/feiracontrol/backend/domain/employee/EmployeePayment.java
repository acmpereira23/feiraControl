package com.feiracontrol.backend.domain.employee;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeePayment(
    UUID id,
    UUID employeeId,
    UUID cashMovementId,
    BigDecimal amount,
    LocalDate paidOn,
    String notes,
    Instant createdAt
) {
}
