package com.feiracontrol.backend.application.fairclosure.query;

import java.time.LocalDate;
import java.util.UUID;

public record GetFairLocationCashClosureQuery(
    UUID fairLocationId,
    LocalDate startDate,
    LocalDate endDate
) {
}
