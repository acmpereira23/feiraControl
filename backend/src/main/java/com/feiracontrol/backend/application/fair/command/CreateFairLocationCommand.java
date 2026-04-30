package com.feiracontrol.backend.application.fair.command;

import java.time.DayOfWeek;
import java.util.Set;

public record CreateFairLocationCommand(
    String name,
    String city,
    String state,
    String reference,
    Set<DayOfWeek> operatingDays
) {
}
