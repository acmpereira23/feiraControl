package com.feiracontrol.backend.application.employee.command;

import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeCommand(
    String name,
    String documentNumber,
    String role,
    BigDecimal defaultDailyRate,
    LocalDate hiredOn,
    EmployeeStatus status
) {
}
