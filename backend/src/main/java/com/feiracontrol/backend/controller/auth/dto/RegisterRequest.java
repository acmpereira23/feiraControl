package com.feiracontrol.backend.controller.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank @Size(max = 140) String fullName,
    @Email @NotBlank @Size(max = 160) String email,
    @NotBlank @Size(min = 8, max = 72) String password
) {
}
