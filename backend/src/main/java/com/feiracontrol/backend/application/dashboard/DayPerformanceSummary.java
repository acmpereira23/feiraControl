package com.feiracontrol.backend.application.dashboard;

import java.math.BigDecimal;
import java.time.DayOfWeek;

public record DayPerformanceSummary(
    DayOfWeek dayOfWeek,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    long movementCount
) {
}
