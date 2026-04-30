package com.feiracontrol.backend.controller;

import com.feiracontrol.backend.application.HealthCheckService;
import com.feiracontrol.backend.application.dto.HealthResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final HealthCheckService healthCheckService;

    public HealthController(HealthCheckService healthCheckService) {
        this.healthCheckService = healthCheckService;
    }

    @GetMapping
    public HealthResponse health() {
        return healthCheckService.check();
    }
}

