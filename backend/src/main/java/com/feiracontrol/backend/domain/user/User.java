package com.feiracontrol.backend.domain.user;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

public record User(
    UUID id,
    String fullName,
    String email,
    String passwordHash,
    UserStatus status,
    Set<UserRole> roles,
    Instant createdAt,
    Instant updatedAt
) {
}
