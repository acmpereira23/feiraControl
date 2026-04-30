package com.feiracontrol.backend.application.dashboard;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.dashboard.exception.InvalidDashboardDateRangeException;
import com.feiracontrol.backend.application.dashboard.query.GetFinancialDashboardQuery;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetFinancialDashboardServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private DashboardSummaryStore dashboardSummaryStore;

    @InjectMocks
    private GetFinancialDashboardService getFinancialDashboardService;

    @Test
    void shouldReturnDashboardForAuthenticatedUser() {
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(dashboardSummaryStore.summarize(
            Optional.of(LocalDate.of(2026, 4, 1)),
            Optional.of(LocalDate.of(2026, 4, 30))
        )).willReturn(new FinancialDashboardSummary(
            new BigDecimal("500.00"),
            new BigDecimal("150.00"),
            new BigDecimal("350.00"),
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30),
            List.of(new DayPerformanceSummary(
                DayOfWeek.MONDAY,
                new BigDecimal("300.00"),
                new BigDecimal("100.00"),
                new BigDecimal("200.00"),
                4
            )),
            List.of(new LocationPerformanceSummary(
                UUID.randomUUID(),
                "Feira Central",
                "Campinas",
                "SP",
                new BigDecimal("500.00"),
                new BigDecimal("150.00"),
                new BigDecimal("350.00"),
                5
            ))
        ));

        var result = getFinancialDashboardService.get(new GetFinancialDashboardQuery(
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30)
        ));

        assertThat(result.totalIncome()).isEqualByComparingTo("500.00");
        assertThat(result.totalExpense()).isEqualByComparingTo("150.00");
        assertThat(result.profit()).isEqualByComparingTo("350.00");
        assertThat(result.byDay()).hasSize(1);
        assertThat(result.byLocation()).hasSize(1);
    }

    @Test
    void shouldRejectInvalidDateRange() {
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));

        assertThatThrownBy(() -> getFinancialDashboardService.get(new GetFinancialDashboardQuery(
            LocalDate.of(2026, 4, 30),
            LocalDate.of(2026, 4, 1)
        )))
            .isInstanceOf(InvalidDashboardDateRangeException.class);
    }
}
