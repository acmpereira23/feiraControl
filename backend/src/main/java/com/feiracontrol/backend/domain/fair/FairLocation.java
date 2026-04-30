package com.feiracontrol.backend.domain.fair;

import java.time.DayOfWeek;
import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record FairLocation(
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
