package com.feiracontrol.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.employee.CreateEmployeeService;
import com.feiracontrol.backend.application.employee.ListEmployeesService;
import com.feiracontrol.backend.application.employee.result.EmployeeView;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.employee.EmployeeController;
import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(EmployeeController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class EmployeeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreateEmployeeService createEmployeeService;

    @MockBean
    private ListEmployeesService listEmployeesService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldCreateEmployee() throws Exception {
        UUID employeeId = UUID.randomUUID();

        given(createEmployeeService.create(any())).willReturn(new EmployeeView(
            employeeId,
            "Maria Clara",
            "12345678900",
            "Caixa",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            EmployeeStatus.ACTIVE,
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Maria Clara",
                      "documentNumber": "12345678900",
                      "role": "Caixa",
                      "defaultDailyRate": 120.00,
                      "hiredOn": "2026-04-29",
                      "status": "ACTIVE"
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(employeeId.toString()))
            .andExpect(jsonPath("$.name").value("Maria Clara"))
            .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    @Test
    void shouldListEmployees() throws Exception {
        UUID employeeId = UUID.randomUUID();

        given(listEmployeesService.list()).willReturn(List.of(new EmployeeView(
            employeeId,
            "Jose Paulo",
            null,
            "Ajudante",
            new BigDecimal("90.00"),
            null,
            EmployeeStatus.INACTIVE,
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        )));

        mockMvc.perform(get("/api/employees"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(employeeId.toString()))
            .andExpect(jsonPath("$[0].name").value("Jose Paulo"))
            .andExpect(jsonPath("$[0].status").value("INACTIVE"));
    }

    @Test
    void shouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/employees")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "",
                      "defaultDailyRate": 0,
                      "status": null
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation error"));
    }
}
