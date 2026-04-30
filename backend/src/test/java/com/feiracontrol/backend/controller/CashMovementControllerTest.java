package com.feiracontrol.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.cash.CreateCashMovementService;
import com.feiracontrol.backend.application.cash.ListCashMovementsService;
import com.feiracontrol.backend.application.cash.result.CashMovementView;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.cash.CashMovementController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import com.feiracontrol.backend.domain.cash.CashMovementType;
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

@WebMvcTest(CashMovementController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class CashMovementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CreateCashMovementService createCashMovementService;

    @MockBean
    private ListCashMovementsService listCashMovementsService;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private JwtAuthenticatedUserConverter jwtAuthenticatedUserConverter;

    @Test
    void shouldCreateCashMovement() throws Exception {
        UUID movementId = UUID.randomUUID();
        UUID fairLocationId = UUID.randomUUID();

        given(createCashMovementService.create(any())).willReturn(new CashMovementView(
            movementId,
            fairLocationId,
            CashMovementType.INCOME,
            "Venda do dia",
            new BigDecimal("150.00"),
            LocalDate.of(2026, 4, 27),
            Instant.parse("2026-04-27T11:30:00Z"),
            Instant.parse("2026-04-27T11:30:00Z")
        ));

        mockMvc.perform(post("/api/cash-movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "fairLocationId": "%s",
                      "type": "INCOME",
                      "description": "Venda do dia",
                      "amount": 150.00,
                      "occurredOn": "2026-04-27"
                    }
                    """.formatted(fairLocationId)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(movementId.toString()))
            .andExpect(jsonPath("$.type").value("INCOME"));
    }

    @Test
    void shouldListCashMovements() throws Exception {
        UUID movementId = UUID.randomUUID();

        given(listCashMovementsService.list(any())).willReturn(List.of(new CashMovementView(
            movementId,
            null,
            CashMovementType.EXPENSE,
            "Compra de insumo",
            new BigDecimal("30.00"),
            LocalDate.of(2026, 4, 26),
            Instant.parse("2026-04-26T09:00:00Z"),
            Instant.parse("2026-04-26T09:00:00Z")
        )));

        mockMvc.perform(get("/api/cash-movements")
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(movementId.toString()))
            .andExpect(jsonPath("$[0].type").value("EXPENSE"));
    }

    @Test
    void shouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/cash-movements")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "type": "INCOME",
                      "description": "",
                      "amount": 0,
                      "occurredOn": null
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation error"));
    }
}
