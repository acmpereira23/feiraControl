package com.feiracontrol.backend.application.fair.result;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record FairLocationView(
    UUID id,
    String name,
    String city,
    String state,
    String reference,
    Set<DayOfWeek> operatingDays,
    Instant createdAt,
    Instant updatedAt
) {
}
