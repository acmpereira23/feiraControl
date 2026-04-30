package com.feiracontrol.backend.controller.dashboard.dto;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.util.List;
import java.time.LocalDate;
import java.util.UUID;

public record FinancialDashboardResponse(
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    LocalDate startDate,
    LocalDate endDate,
    List<DayPerformanceResponse> byDay,
    List<LocationPerformanceResponse> byLocation
) {
    public record DayPerformanceResponse(
        DayOfWeek dayOfWeek,
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal profit,
        long movementCount
    ) {
    }

    public record LocationPerformanceResponse(
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
}
