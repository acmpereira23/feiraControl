package com.feiracontrol.backend.domain.cash;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CashMovement(
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
