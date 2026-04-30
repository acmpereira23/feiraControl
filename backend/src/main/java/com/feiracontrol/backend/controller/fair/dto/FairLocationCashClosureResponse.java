package com.feiracontrol.backend.controller.fair.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record FairLocationCashClosureResponse(
    UUID fairLocationId,
    String fairLocationName,
    String city,
    String state,
    LocalDate startDate,
    LocalDate endDate,
    BigDecimal totalIncome,
    BigDecimal totalExpense,
    BigDecimal profit,
    long movementCount
) {
}
