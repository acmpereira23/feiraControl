package com.feiracontrol.backend.application.employeepayment.command;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateEmployeePaymentCommand(
    UUID employeeId,
    BigDecimal amount,
    LocalDate paidOn,
    String notes
) {
}
