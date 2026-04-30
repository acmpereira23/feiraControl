package com.feiracontrol.backend.controller.employee.dto;

import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreateEmployeeRequest(
    @NotBlank @Size(max = 140) String name,
    @Size(max = 32) String documentNumber,
    @Size(max = 120) String role,
    @DecimalMin(value = "0.01") @Digits(integer = 17, fraction = 2) BigDecimal defaultDailyRate,
    LocalDate hiredOn,
    @NotNull EmployeeStatus status
) {
}
