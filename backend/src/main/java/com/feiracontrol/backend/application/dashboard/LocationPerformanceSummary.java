package com.feiracontrol.backend.application.dashboard;

import java.math.BigDecimal;
import java.util.UUID;

public record LocationPerformanceSummary(
    UUID fairLocationId,
    String fairLocationName,
    String city,
    String state,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    long movementCount
) {
}
