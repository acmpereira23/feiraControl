package com.feiracontrol.backend.application.cash;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.cash.exception.InvalidCashMovementDateRangeException;
import com.feiracontrol.backend.application.cash.query.ListCashMovementsQuery;
import com.feiracontrol.backend.application.cash.result.CashMovementView;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ListCashMovementsService {

    private final AuthContextService authContextService;
    private final CashMovementStore cashMovementStore;

    public ListCashMovementsService(
        AuthContextService authContextService,
        CashMovementStore cashMovementStore
    ) {
        this.authContextService = authContextService;
        this.cashMovementStore = cashMovementStore;
    }

    public List<CashMovementView> list(ListCashMovementsQuery query) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        if (query.startDate() != null && query.endDate() != null && query.startDate().isAfter(query.endDate())) {
            throw new InvalidCashMovementDateRangeException();
        }

        return cashMovementStore.list(
                Optional.ofNullable(query.startDate()),
                Optional.ofNullable(query.endDate())
            ).stream()
            .map(cashMovement -> new CashMovementView(
                cashMovement.id(),
                cashMovement.fairLocationId(),
                cashMovement.type(),
                cashMovement.description(),
                cashMovement.amount(),
                cashMovement.occurredOn(),
                cashMovement.createdAt(),
                cashMovement.updatedAt()
            ))
            .toList();
    }
}
