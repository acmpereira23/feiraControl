package com.feiracontrol.backend.application.auth.token;

import java.util.Set;
import java.util.UUID;

public record TokenPayload(
    UUID userId,
    String subject,
    Set<String> authorities
) {
}
