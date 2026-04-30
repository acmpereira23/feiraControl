package com.feiracontrol.backend.application.cash;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.cash.command.CreateCashMovementCommand;
import com.feiracontrol.backend.application.cash.exception.InvalidFairLocationReferenceException;
import com.feiracontrol.backend.application.cash.result.CashMovementView;
import com.feiracontrol.backend.domain.cash.CashMovement;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CreateCashMovementService {

    private final AuthContextService authContextService;
    private final CashMovementStore cashMovementStore;
    private final FairLocationAccess fairLocationAccess;

    public CreateCashMovementService(
        AuthContextService authContextService,
        CashMovementStore cashMovementStore,
        FairLocationAccess fairLocationAccess
    ) {
        this.authContextService = authContextService;
        this.cashMovementStore = cashMovementStore;
        this.fairLocationAccess = fairLocationAccess;
    }

    @Transactional
    public CashMovementView create(CreateCashMovementCommand command) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        if (command.fairLocationId() != null
            && !fairLocationAccess.existsById(command.fairLocationId())) {
            throw new InvalidFairLocationReferenceException();
        }

        CashMovement created = cashMovementStore.create(new NewCashMovement(
            command.fairLocationId(),
            command.type(),
            command.description().trim(),
            command.amount(),
            command.occurredOn()
        ));

        return toView(created);
    }

    private CashMovementView toView(CashMovement cashMovement) {
        return new CashMovementView(
            cashMovement.id(),
            cashMovement.fairLocationId(),
            cashMovement.type(),
            cashMovement.description(),
            cashMovement.amount(),
            cashMovement.occurredOn(),
            cashMovement.createdAt(),
            cashMovement.updatedAt()
        );
    }
}
