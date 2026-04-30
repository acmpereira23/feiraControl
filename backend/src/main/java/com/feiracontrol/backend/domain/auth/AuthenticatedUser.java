package com.feiracontrol.backend.domain.auth;

import java.util.Set;
import java.util.UUID;

public record AuthenticatedUser(
    UUID userId,
    String email,
    Set<String> authorities,
    AuthenticationScheme scheme
) {
}
