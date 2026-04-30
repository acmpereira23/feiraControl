package com.feiracontrol.backend.infrastructure.auth.credential;

import com.feiracontrol.backend.application.auth.credential.CredentialHasher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class BCryptCredentialHasher implements CredentialHasher {

    private final PasswordEncoder passwordEncoder;

    public BCryptCredentialHasher(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public String hash(String rawSecret) {
        return passwordEncoder.encode(rawSecret);
    }

    @Override
    public boolean matches(String rawSecret, String hashedSecret) {
        return passwordEncoder.matches(rawSecret, hashedSecret);
    }
}
