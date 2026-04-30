package com.feiracontrol.backend.application.employee;

import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.LocalDate;

public record NewEmployee(
    String name,
    String documentNumber,
    String role,
    BigDecimal defaultDailyRate,
    LocalDate hiredOn,
    EmployeeStatus status
) {
}
