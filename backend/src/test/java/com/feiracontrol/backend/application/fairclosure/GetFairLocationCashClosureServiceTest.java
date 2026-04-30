package com.feiracontrol.backend.application.fairclosure;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.fair.FairLocationStore;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureDateRangeException;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureReferenceException;
import com.feiracontrol.backend.application.fairclosure.query.GetFairLocationCashClosureQuery;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.fair.FairLocation;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class GetFairLocationCashClosureServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private FairLocationStore fairLocationStore;

    @Mock
    private FairLocationCashClosureStore fairLocationCashClosureStore;

    @InjectMocks
    private GetFairLocationCashClosureService getFairLocationCashClosureService;

    @Test
    void shouldReturnClosureForAuthenticatedUser() {
        UUID fairLocationId = UUID.randomUUID();
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationStore.findById(fairLocationId)).willReturn(Optional.of(new FairLocation(
            fairLocationId,
            "Feira Central",
            "Campinas",
            "SP",
            null,
            Set.of(DayOfWeek.SATURDAY),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        )));
        given(fairLocationCashClosureStore.summarize(
            fairLocationId,
            Optional.of(LocalDate.of(2026, 4, 1)),
            Optional.of(LocalDate.of(2026, 4, 30))
        )).willReturn(new FairLocationCashClosureMetrics(
            new BigDecimal("600.00"),
            new BigDecimal("180.00"),
            new BigDecimal("420.00"),
            7
        ));

        var result = getFairLocationCashClosureService.get(new GetFairLocationCashClosureQuery(
            fairLocationId,
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30)
        ));

        assertThat(result.fairLocationName()).isEqualTo("Feira Central");
        assertThat(result.totalIncome()).isEqualByComparingTo("600.00");
        assertThat(result.totalExpense()).isEqualByComparingTo("180.00");
        assertThat(result.profit()).isEqualByComparingTo("420.00");
        assertThat(result.movementCount()).isEqualTo(7);
    }

    @Test
    void shouldRejectInvalidDateRange() {
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));

        assertThatThrownBy(() -> getFairLocationCashClosureService.get(new GetFairLocationCashClosureQuery(
            UUID.randomUUID(),
            LocalDate.of(2026, 4, 30),
            LocalDate.of(2026, 4, 1)
        )))
            .isInstanceOf(InvalidFairLocationCashClosureDateRangeException.class);
    }

    @Test
    void shouldRejectUnknownFairLocation() {
        UUID fairLocationId = UUID.randomUUID();
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationStore.findById(fairLocationId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> getFairLocationCashClosureService.get(new GetFairLocationCashClosureQuery(
            fairLocationId,
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30)
        )))
            .isInstanceOf(InvalidFairLocationCashClosureReferenceException.class);
    }
}
