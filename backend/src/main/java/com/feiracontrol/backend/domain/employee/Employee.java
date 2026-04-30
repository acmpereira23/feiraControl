package com.feiracontrol.backend.domain.employee;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record Employee(
    UUID id,
    String name,
    String documentNumber,
    String role,
    BigDecimal defaultDailyRate,
    LocalDate hiredOn,
    EmployeeStatus status,
    Instant createdAt,
    Instant updatedAt
) {
}
