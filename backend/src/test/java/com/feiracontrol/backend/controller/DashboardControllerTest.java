package com.feiracontrol.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.dashboard.FinancialDashboardSummary;
import com.feiracontrol.backend.application.dashboard.GetFinancialDashboardService;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.dashboard.DashboardController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(DashboardController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private GetFinancialDashboardService getFinancialDashboardService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldReturnFinancialDashboard() throws Exception {
        given(getFinancialDashboardService.get(any())).willReturn(new FinancialDashboardSummary(
            new BigDecimal("500.00"),
            new BigDecimal("150.00"),
            new BigDecimal("350.00"),
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30),
            List.of(new com.feiracontrol.backend.application.dashboard.DayPerformanceSummary(
                DayOfWeek.MONDAY,
                new BigDecimal("300.00"),
                new BigDecimal("100.00"),
                new BigDecimal("200.00"),
                4
            )),
            List.of(new com.feiracontrol.backend.application.dashboard.LocationPerformanceSummary(
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

        mockMvc.perform(get("/api/dashboard")
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.totalIncome").value(500.00))
            .andExpect(jsonPath("$.totalExpense").value(150.00))
            .andExpect(jsonPath("$.profit").value(350.00))
            .andExpect(jsonPath("$.byDay[0].dayOfWeek").value("MONDAY"))
            .andExpect(jsonPath("$.byLocation[0].fairLocationName").value("Feira Central"));
    }
}
