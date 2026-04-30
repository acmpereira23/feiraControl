package com.feiracontrol.backend.application.cash;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.cash.exception.InvalidCashMovementDateRangeException;
import com.feiracontrol.backend.application.cash.query.ListCashMovementsQuery;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.cash.CashMovement;
import com.feiracontrol.backend.domain.cash.CashMovementType;
import java.math.BigDecimal;
import java.time.Instant;
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
class ListCashMovementsServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private CashMovementStore cashMovementStore;

    @InjectMocks
    private ListCashMovementsService listCashMovementsService;

    @Test
    void shouldListCashMovementsForAuthenticatedUser() {
        UUID movementId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(cashMovementStore.list(
            Optional.of(LocalDate.of(2026, 4, 1)),
            Optional.of(LocalDate.of(2026, 4, 30))
        )).willReturn(List.of(new CashMovement(
            movementId,
            null,
            CashMovementType.INCOME,
            "Venda",
            new BigDecimal("50.00"),
            LocalDate.of(2026, 4, 10),
            Instant.parse("2026-04-10T11:00:00Z"),
            Instant.parse("2026-04-10T11:00:00Z")
        )));

        var result = listCashMovementsService.list(new ListCashMovementsQuery(
            LocalDate.of(2026, 4, 1),
            LocalDate.of(2026, 4, 30)
        ));

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(movementId);
        assertThat(result.getFirst().description()).isEqualTo("Venda");
    }

    @Test
    void shouldRejectInvalidDateRange() {
        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));

        assertThatThrownBy(() -> listCashMovementsService.list(new ListCashMovementsQuery(
            LocalDate.of(2026, 4, 30),
            LocalDate.of(2026, 4, 1)
        )))
            .isInstanceOf(InvalidCashMovementDateRangeException.class);
    }
}
