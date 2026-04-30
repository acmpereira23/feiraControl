package com.feiracontrol.backend.application.auth.account;

import com.feiracontrol.backend.domain.user.UserRole;
import com.feiracontrol.backend.domain.user.UserStatus;
import java.util.Set;
import java.util.UUID;

public record AuthAccount(
    UUID userId,
    String email,
    String passwordHash,
    UserStatus status,
    Set<UserRole> roles
) {
}
