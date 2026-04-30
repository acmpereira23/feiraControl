package com.feiracontrol.backend.application.fairclosure;

import java.math.BigDecimal;

public record FairLocationCashClosureMetrics(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    long movementCount
) {
}
