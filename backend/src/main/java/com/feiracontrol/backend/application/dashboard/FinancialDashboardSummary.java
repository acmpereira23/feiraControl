package com.feiracontrol.backend.application.dashboard;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record FinancialDashboardSummary(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    LocalDate startDate,
    LocalDate endDate,
    List<DayPerformanceSummary> byDay,
    List<LocationPerformanceSummary> byLocation
) {
}
