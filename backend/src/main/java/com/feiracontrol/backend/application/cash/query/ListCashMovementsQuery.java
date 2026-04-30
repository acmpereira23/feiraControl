package com.feiracontrol.backend.application.cash.query;

import java.time.LocalDate;

public record ListCashMovementsQuery(
    LocalDate startDate,
    LocalDate endDate
) {
}
