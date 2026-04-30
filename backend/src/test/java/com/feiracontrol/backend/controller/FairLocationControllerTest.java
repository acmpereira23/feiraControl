package com.feiracontrol.backend.controller;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.feiracontrol.backend.application.fair.CreateFairLocationService;
import com.feiracontrol.backend.application.fair.ListFairLocationsService;
import com.feiracontrol.backend.application.fair.result.FairLocationView;
import com.feiracontrol.backend.application.fairclosure.FairLocationCashClosureSummary;
import com.feiracontrol.backend.application.fairclosure.GetFairLocationCashClosureService;
import com.feiracontrol.backend.config.SecurityConfig;
import com.feiracontrol.backend.controller.fair.FairLocationController;
import com.feiracontrol.backend.infrastructure.auth.security.JwtAuthenticatedUserConverter;
import java.time.DayOfWeek;
import java.time.Instant;
import java.util.List;
import java.util.Set;
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

@WebMvcTest(FairLocationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(SecurityConfig.class)
class FairLocationControllerTest {

    @Autowired
    private MockMvc mockMvc;

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
    void shouldCreateFairLocation() throws Exception {
        UUID fairLocationId = UUID.randomUUID();

        given(createFairLocationService.create(any())).willReturn(new FairLocationView(
            fairLocationId,
            "Feira da Praca",
            "Campinas",
            "SP",
            "Perto da igreja",
            Set.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        mockMvc.perform(post("/api/fair-locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "Feira da Praca",
                      "city": "Campinas",
                      "state": "SP",
                      "reference": "Perto da igreja",
                      "operatingDays": ["MONDAY", "WEDNESDAY"]
                    }
                    """))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(fairLocationId.toString()))
            .andExpect(jsonPath("$.name").value("Feira da Praca"))
            .andExpect(jsonPath("$.operatingDays", containsInAnyOrder("MONDAY", "WEDNESDAY")));
    }

    @Test
    void shouldListFairLocations() throws Exception {
        UUID fairLocationId = UUID.randomUUID();

        given(listFairLocationsService.list()).willReturn(List.of(new FairLocationView(
            fairLocationId,
            "Feira Central",
            "Campinas",
            "SP",
            null,
            Set.of(DayOfWeek.SATURDAY),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        )));

        mockMvc.perform(get("/api/fair-locations"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].id").value(fairLocationId.toString()))
            .andExpect(jsonPath("$[0].name").value("Feira Central"))
            .andExpect(jsonPath("$[0].operatingDays[0]").value("SATURDAY"));
    }

    @Test
    void shouldRejectInvalidPayload() throws Exception {
        mockMvc.perform(post("/api/fair-locations")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                    {
                      "name": "",
                      "city": "",
                      "state": "",
                      "operatingDays": []
                    }
                    """))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Validation error"));
    }

    @Test
    void shouldReturnCashClosureForFairLocation() throws Exception {
        UUID fairLocationId = UUID.randomUUID();

        given(getFairLocationCashClosureService.get(any())).willReturn(new FairLocationCashClosureSummary(
            fairLocationId,
            "Feira Central",
            "Campinas",
            "SP",
            java.time.LocalDate.of(2026, 4, 1),
            java.time.LocalDate.of(2026, 4, 30),
            new java.math.BigDecimal("600.00"),
            new java.math.BigDecimal("180.00"),
            new java.math.BigDecimal("420.00"),
            7
        ));

        mockMvc.perform(get("/api/fair-locations/{fairLocationId}/cash-closure", fairLocationId)
                .param("startDate", "2026-04-01")
                .param("endDate", "2026-04-30"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.fairLocationId").value(fairLocationId.toString()))
            .andExpect(jsonPath("$.fairLocationName").value("Feira Central"))
            .andExpect(jsonPath("$.totalIncome").value(600.00))
            .andExpect(jsonPath("$.profit").value(420.00))
            .andExpect(jsonPath("$.movementCount").value(7));
    }
}
