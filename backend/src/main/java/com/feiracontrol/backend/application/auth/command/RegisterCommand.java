package com.feiracontrol.backend.application.auth.command;

public record RegisterCommand(
    String fullName,
    String email,
    String password
) {
}
