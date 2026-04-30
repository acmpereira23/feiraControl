package com.feiracontrol.backend.application.cash.result;

import com.feiracontrol.backend.domain.cash.CashMovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CashMovementView(
    UUID id,
    UUID fairLocationId,
    CashMovementType type,
    String description,
    BigDecimal amount,
    LocalDate occurredOn,
    Instant createdAt,
    Instant updatedAt
) {
}
