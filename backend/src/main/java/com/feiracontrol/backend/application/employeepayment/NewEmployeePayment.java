package com.feiracontrol.backend.application.employeepayment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record NewEmployeePayment(
    UUID employeeId,
    UUID cashMovementId,
    BigDecimal amount,
    LocalDate paidOn,
    String notes
) {
}
