package com.feiracontrol.backend.application.auth.result;

import java.util.Set;
import java.util.UUID;

public record AuthSessionView(
    UUID userId,
    String email,
    Set<String> authorities
) {
}
