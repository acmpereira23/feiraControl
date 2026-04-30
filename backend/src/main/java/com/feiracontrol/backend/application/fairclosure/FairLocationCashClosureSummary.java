package com.feiracontrol.backend.application.fairclosure;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FairLocationCashClosureSummary(
    UUID fairLocationId,
    String fairLocationName,
    String city,
    String state,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    long movementCount
) {
}
