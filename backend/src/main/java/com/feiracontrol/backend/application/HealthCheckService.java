package com.feiracontrol.backend.application;

import com.feiracontrol.backend.application.dto.HealthResponse;
import com.feiracontrol.backend.domain.system.ApplicationStatus;
import com.feiracontrol.backend.infrastructure.system.ApplicationMetadataProvider;
import org.springframework.stereotype.Service;

@Service
public class HealthCheckService {

    private final ApplicationMetadataProvider applicationMetadataProvider;

    public HealthCheckService(ApplicationMetadataProvider applicationMetadataProvider) {
        this.applicationMetadataProvider = applicationMetadataProvider;
    }

    public HealthResponse check() {
        return new HealthResponse(
            ApplicationStatus.UP,
            applicationMetadataProvider.applicationName(),
            applicationMetadataProvider.applicationVersion()
        );
    }
}
