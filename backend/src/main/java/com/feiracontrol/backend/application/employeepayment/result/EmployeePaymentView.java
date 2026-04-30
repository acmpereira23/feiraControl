package com.feiracontrol.backend.application.employeepayment.result;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeePaymentView(
    UUID id,
    UUID employeeId,
    UUID cashMovementId,
    BigDecimal amount,
    LocalDate paidOn,
    String notes,
    Instant createdAt
) {
}
