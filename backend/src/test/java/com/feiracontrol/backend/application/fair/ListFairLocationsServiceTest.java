package com.feiracontrol.backend.application.fair;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.fair.FairLocation;
import java.time.DayOfWeek;
import java.time.Instant;
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
class ListFairLocationsServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private FairLocationStore fairLocationStore;

    @InjectMocks
    private ListFairLocationsService listFairLocationsService;

    @Test
    void shouldListFairLocationsForAuthenticatedUser() {
        UUID fairLocationId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationStore.list()).willReturn(List.of(new FairLocation(
            fairLocationId,
            "Feira Central",
            "Campinas",
            "SP",
            null,
            Set.of(DayOfWeek.SATURDAY),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        )));

        var result = listFairLocationsService.list();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(fairLocationId);
        assertThat(result.getFirst().name()).isEqualTo("Feira Central");
        assertThat(result.getFirst().operatingDays()).containsExactly(DayOfWeek.SATURDAY);
    }
}
