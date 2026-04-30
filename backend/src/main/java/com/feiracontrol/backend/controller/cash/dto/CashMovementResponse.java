package com.feiracontrol.backend.controller.cash.dto;

import com.feiracontrol.backend.domain.cash.CashMovementType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record CashMovementResponse(
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
