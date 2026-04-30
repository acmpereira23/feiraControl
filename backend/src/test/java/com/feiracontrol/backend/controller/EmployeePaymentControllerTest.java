package com.feiracontrol.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.employeepayment.CreateEmployeePaymentService;
import com.feiracontrol.backend.application.employeepayment.result.EmployeePaymentView;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.employeepayment.EmployeePaymentController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
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

@WebMvcTest(EmployeePaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class EmployeePaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreateEmployeePaymentService createEmployeePaymentService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldCreateEmployeePayment() throws Exception {
        UUID paymentId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();
        UUID cashMovementId = UUID.randomUUID();

        given(createEmployeePaymentService.create(any())).willReturn(new EmployeePaymentView(
            paymentId,
            employeeId,
            cashMovementId,
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            "Pix",
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        mockMvc.perform(post("/api/employee-payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "employeeId": "%s",
                      "amount": 120.00,
                      "paidOn": "2026-04-29",
                      "notes": "Pix"
                    }
                    """.formatted(employeeId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(paymentId.toString()))
            .andExpect(jsonPath("$.employeeId").value(employeeId.toString()))
            .andExpect(jsonPath("$.cashMovementId").value(cashMovementId.toString()));
    }

    @Test
    void shouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/employee-payments")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "employeeId": null,
                      "amount": 0,
                      "paidOn": null
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation error"));
    }
}
