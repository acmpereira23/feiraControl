package com.feiracontrol.backend.application.dashboard.query;

import java.time.LocalDate;

public record GetFinancialDashboardQuery(
    LocalDate startDate,
    LocalDate endDate
) {
}
