package com.feiracontrol.backend.controller.employeepayment.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeePaymentRequest(
    @NotNull UUID employeeId,
    @NotNull
    @DecimalMin(value = "0.01", inclusive = true)
    @Digits(integer = 17, fraction = 2)
    BigDecimal amount,
    @NotNull LocalDate paidOn,
    @Size(max = 255) String notes
) {
}
