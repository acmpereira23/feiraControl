package com.feiracontrol.backend.application.cash;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.cash.command.CreateCashMovementCommand;
import com.feiracontrol.backend.application.cash.exception.InvalidFairLocationReferenceException;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.cash.CashMovement;
import com.feiracontrol.backend.domain.cash.CashMovementType;
import java.math.BigDecimal;
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
class CreateCashMovementServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private CashMovementStore cashMovementStore;

    @Mock
    private FairLocationAccess fairLocationAccess;

    @InjectMocks
    private CreateCashMovementService createCashMovementService;

    @Test
    void shouldCreateCashMovementForAuthenticatedUser() {
        UUID userId = UUID.randomUUID();
        UUID fairLocationId = UUID.randomUUID();
        UUID movementId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            userId,
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationAccess.existsById(fairLocationId)).willReturn(true);
        given(cashMovementStore.create(any())).willReturn(new CashMovement(
            movementId,
            fairLocationId,
            CashMovementType.INCOME,
            "Venda do dia",
            new BigDecimal("125.50"),
            LocalDate.of(2026, 4, 27),
            Instant.parse("2026-04-27T10:00:00Z"),
            Instant.parse("2026-04-27T10:00:00Z")
        ));

        var result = createCashMovementService.create(new CreateCashMovementCommand(
            fairLocationId,
            CashMovementType.INCOME,
            "  Venda do dia  ",
            new BigDecimal("125.50"),
            LocalDate.of(2026, 4, 27)
        ));

        assertThat(result.id()).isEqualTo(movementId);
        assertThat(result.description()).isEqualTo("Venda do dia");
        verify(cashMovementStore).create(any());
    }

    @Test
    void shouldRejectInvalidFairLocationReference() {
        UUID fairLocationId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(fairLocationAccess.existsById(fairLocationId)).willReturn(false);

        assertThatThrownBy(() -> createCashMovementService.create(new CreateCashMovementCommand(
            fairLocationId,
            CashMovementType.EXPENSE,
            "Compra",
            new BigDecimal("10.00"),
            LocalDate.of(2026, 4, 27)
        )))
            .isInstanceOf(InvalidFairLocationReferenceException.class);
    }
}
