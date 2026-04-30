package com.feiracontrol.backend.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.auth.LoginService;
import com.feiracontrol.backend.application.auth.RegisterService;
import com.feiracontrol.backend.application.auth.SessionService;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import com.feiracontrol.backend.application.cash.CreateCashMovementService;
import com.feiracontrol.backend.application.cash.ListCashMovementsService;
import com.feiracontrol.backend.application.dashboard.GetFinancialDashboardService;
import com.feiracontrol.backend.application.employee.CreateEmployeeService;
import com.feiracontrol.backend.application.employee.ListEmployeesService;
import com.feiracontrol.backend.application.employeepayment.CreateEmployeePaymentService;
import com.feiracontrol.backend.application.fair.CreateFairLocationService;
import com.feiracontrol.backend.application.fair.ListFairLocationsService;
import com.feiracontrol.backend.application.fairclosure.GetFairLocationCashClosureService;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.auth.AuthController;
import com.feiracontrol.backend.controller.cash.CashMovementController;
import com.feiracontrol.backend.controller.dashboard.DashboardController;
import com.feiracontrol.backend.controller.employee.EmployeeController;
import com.feiracontrol.backend.controller.employeepayment.EmployeePaymentController;
import com.feiracontrol.backend.controller.fair.FairLocationController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({
    AuthController.class,
    CashMovementController.class,
    DashboardController.class,
    EmployeeController.class,
    EmployeePaymentController.class,
    FairLocationController.class
})
@Import(SecurityConfig.class)
class ProtectedApiSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private RegisterService registerService;

    @MockBean
    private LoginService loginService;

    @MockBean
    private SessionService sessionService;

    @MockBean
    private CreateCashMovementService createCashMovementService;

    @MockBean
    private ListCashMovementsService listCashMovementsService;

    @MockBean
    private GetFinancialDashboardService getFinancialDashboardService;

    @MockBean
    private CreateEmployeeService createEmployeeService;

    @MockBean
    private ListEmployeesService listEmployeesService;

    @MockBean
    private CreateEmployeePaymentService createEmployeePaymentService;

    @MockBean
    private CreateFairLocationService createFairLocationService;

    @MockBean
    private ListFairLocationsService listFairLocationsService;

    @MockBean
    private GetFairLocationCashClosureService getFairLocationCashClosureService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldRejectUnauthenticatedSessionRequest() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedCashMovementCreation() throws Exception {
        mockMvc.perform(post("/api/cash-movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "INCOME",
                      "description": "Venda do dia",
                      "amount": 150.00,
                      "occurredOn": "2026-04-27"
                    }
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedCashMovementListing() throws Exception {
        mockMvc.perform(get("/api/cash-movements")
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedDashboardRequest() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedEmployeeCreation() throws Exception {
        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Maria Clara",
                      "status": "ACTIVE"
                    }
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedEmployeeListing() throws Exception {
        mockMvc.perform(get("/api/employees"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedEmployeePaymentCreation() throws Exception {
        mockMvc.perform(post("/api/employee-payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "employeeId": "%s",
                      "amount": 120.00,
                      "paidOn": "2026-04-29"
                    }
                    """.formatted(UUID.randomUUID())))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedFairLocationCreation() throws Exception {
        mockMvc.perform(post("/api/fair-locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Feira da Praca",
                      "city": "Campinas",
                      "state": "SP",
                      "operatingDays": ["MONDAY"]
                    }
                    """))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedFairLocationListing() throws Exception {
        mockMvc.perform(get("/api/fair-locations"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectUnauthenticatedFairLocationCashClosureRequest() throws Exception {
        mockMvc.perform(get("/api/fair-locations/{fairLocationId}/cash-closure", UUID.randomUUID())
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldAllowAuthenticatedProtectedRequests() throws Exception {
        given(sessionService.currentSession()).willReturn(new AuthSessionView(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER")
        ));

        mockMvc.perform(get("/api/auth/me").with(user("owner@feira.com")))
            .andExpect(status().isOk());
    }
}
