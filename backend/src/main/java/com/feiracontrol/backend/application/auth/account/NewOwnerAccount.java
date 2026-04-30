package com.feiracontrol.backend.application.auth.account;

public record NewOwnerAccount(
    String fullName,
    String email,
    String passwordHash
) {
}
