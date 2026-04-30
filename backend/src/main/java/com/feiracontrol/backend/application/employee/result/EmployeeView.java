package com.feiracontrol.backend.application.employee.result;

import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record EmployeeView(
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
