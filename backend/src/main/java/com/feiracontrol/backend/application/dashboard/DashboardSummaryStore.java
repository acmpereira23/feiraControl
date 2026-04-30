package com.feiracontrol.backend.application.dashboard;

import java.time.LocalDate;
import java.util.Optional;

public interface DashboardSummaryStore {

    FinancialDashboardSummary summarize(
        Optional<LocalDate> startDate,
        Optional<LocalDate> endDate
    );
}
