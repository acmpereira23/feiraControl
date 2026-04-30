package com.feiracontrol.backend.controller.fair.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.time.DayOfWeek;
import java.util.Set;

public record CreateFairLocationRequest(
    @NotBlank @Size(max = 140) String name,
    @NotBlank @Size(max = 120) String city,
    @NotBlank @Size(max = 60) String state,
    @Size(max = 255) String reference,
    @NotEmpty Set<DayOfWeek> operatingDays
) {
}
