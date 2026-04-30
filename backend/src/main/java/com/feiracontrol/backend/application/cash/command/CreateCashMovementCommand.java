package com.feiracontrol.backend.application.cash.command;

import com.feiracontrol.backend.domain.cash.CashMovementType;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateCashMovementCommand(
    UUID fairLocationId,
    CashMovementType type,
    String description,
    BigDecimal amount,
    LocalDate occurredOn
) {
}
