package com.feiracontrol.backend.application.dashboard;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.dashboard.exception.InvalidDashboardDateRangeException;
import com.feiracontrol.backend.application.dashboard.query.GetFinancialDashboardQuery;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class GetFinancialDashboardService {

    private final AuthContextService authContextService;
    private final DashboardSummaryStore dashboardSummaryStore;

    public GetFinancialDashboardService(
        AuthContextService authContextService,
        DashboardSummaryStore dashboardSummaryStore
    ) {
        this.authContextService = authContextService;
        this.dashboardSummaryStore = dashboardSummaryStore;
    }

    public FinancialDashboardSummary get(GetFinancialDashboardQuery query) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        if (query.startDate() != null && query.endDate() != null && query.startDate().isAfter(query.endDate())) {
            throw new InvalidDashboardDateRangeException();
        }

        return dashboardSummaryStore.summarize(
            Optional.ofNullable(query.startDate()),
            Optional.ofNullable(query.endDate())
        );
    }
}
