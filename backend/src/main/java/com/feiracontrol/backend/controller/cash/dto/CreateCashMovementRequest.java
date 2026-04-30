package com.feiracontrol.backend.controller.cash.dto;

import com.feiracontrol.backend.domain.cash.CashMovementType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateCashMovementRequest(
    UUID fairLocationId,
    @NotNull CashMovementType type,
    @NotBlank @Size(max = 255) String description,
    @NotNull @DecimalMin(value = "0.01") @Digits(integer = 17, fraction = 2) BigDecimal amount,
    @NotNull LocalDate occurredOn
) {
}
