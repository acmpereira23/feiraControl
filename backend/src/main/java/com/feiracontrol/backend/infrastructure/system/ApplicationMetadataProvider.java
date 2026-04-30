package com.feiracontrol.backend.infrastructure.system;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ApplicationMetadataProvider {

    private final String applicationName;
    private final String applicationVersion;

    public ApplicationMetadataProvider(
        @Value("${spring.application.name}") String applicationName,
        @Value("${application.version:local}") String applicationVersion
    ) {
        this.applicationName = applicationName;
        this.applicationVersion = applicationVersion;
    }

    public String applicationName() {
        return applicationName;
    }

    public String applicationVersion() {
        return applicationVersion;
    }
}
