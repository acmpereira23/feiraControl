package com.feiracontrol.backend.application.fair;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.fair.command.CreateFairLocationCommand;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.fair.FairLocation;
import java.time.DayOfWeek;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateFairLocationServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private FairLocationStore fairLocationStore;

    @InjectMocks
    private CreateFairLocationService createFairLocationService;

    @Test
    void shouldCreateFairLocationForAuthenticatedUser() {
        UUID fairLocationId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationStore.create(any())).willReturn(new FairLocation(
            fairLocationId,
            "Feira da Praca",
            "Campinas",
            "SP",
            "Perto da igreja",
            Set.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        var result = createFairLocationService.create(new CreateFairLocationCommand(
            "  Feira da Praca  ",
            " Campinas ",
            " SP ",
            " Perto da igreja ",
            Set.of(DayOfWeek.WEDNESDAY, DayOfWeek.MONDAY)
        ));

        assertThat(result.id()).isEqualTo(fairLocationId);
        assertThat(result.name()).isEqualTo("Feira da Praca");
        assertThat(result.city()).isEqualTo("Campinas");
        assertThat(result.state()).isEqualTo("SP");
        assertThat(result.reference()).isEqualTo("Perto da igreja");
        assertThat(result.operatingDays()).containsExactlyInAnyOrder(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY);
        verify(fairLocationStore).create(any());
    }
}
