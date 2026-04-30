package com.feiracontrol.backend.application.cash;

import com.feiracontrol.backend.domain.cash.CashMovement;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface CashMovementStore {

    CashMovement create(NewCashMovement newCashMovement);

    List<CashMovement> list(Optional<LocalDate> startDate, Optional<LocalDate> endDate);
}
