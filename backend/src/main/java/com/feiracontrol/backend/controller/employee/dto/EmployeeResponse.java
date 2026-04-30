package com.feiracontrol.backend.controller.employee.dto;

import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeResponse(
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
