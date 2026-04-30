package com.feiracontrol.backend.controller.dashboard;

import com.feiracontrol.backend.application.dashboard.GetFinancialDashboardService;
import com.feiracontrol.backend.application.dashboard.query.GetFinancialDashboardQuery;
import com.feiracontrol.backend.controller.dashboard.dto.FinancialDashboardResponse;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final GetFinancialDashboardService getFinancialDashboardService;

    public DashboardController(GetFinancialDashboardService getFinancialDashboardService) {
        this.getFinancialDashboardService = getFinancialDashboardService;
    }

    @GetMapping
    public FinancialDashboardResponse get(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var summary = getFinancialDashboardService.get(new GetFinancialDashboardQuery(startDate, endDate));

        return new FinancialDashboardResponse(
            summary.totalIncome(),
            summary.totalExpense(),
            summary.profit(),
            summary.startDate(),
            summary.endDate(),
            summary.byDay().stream()
                .map(day -> new FinancialDashboardResponse.DayPerformanceResponse(
                    day.dayOfWeek(),
                    day.totalIncome(),
                    day.totalExpense(),
                    day.profit(),
                    day.movementCount()
                ))
                .toList(),
            summary.byLocation().stream()
                .map(location -> new FinancialDashboardResponse.LocationPerformanceResponse(
                    location.fairLocationId(),
                    location.fairLocationName(),
                    location.city(),
                    location.state(),
                    location.totalIncome(),
                    location.totalExpense(),
                    location.profit(),
                    location.movementCount()
                ))
                .toList()
        );
    }
}
