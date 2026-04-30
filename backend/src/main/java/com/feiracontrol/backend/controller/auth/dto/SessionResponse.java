package com.feiracontrol.backend.controller.auth.dto;

import java.util.Set;
import java.util.UUID;

public record SessionResponse(
    UUID userId,
    String email,
    Set<String> authorities
) {
}
