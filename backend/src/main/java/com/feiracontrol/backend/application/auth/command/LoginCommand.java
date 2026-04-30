package com.feiracontrol.backend.application.auth.command;

public record LoginCommand(
    String email,
    String password
) {
}
