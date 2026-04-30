package com.feiracontrol.backend.application.dto;

import com.feiracontrol.backend.domain.system.ApplicationStatus;

public record HealthResponse(
    ApplicationStatus status,
    String application,
    String version
) {
}
