package com.feiracontrol.backend.application.fair;

import java.time.DayOfWeek;
import java.util.Set;

public record NewFairLocation(
    String name,
    String city,
    String state,
    String reference,
    Set<DayOfWeek> operatingDays
) {
}
