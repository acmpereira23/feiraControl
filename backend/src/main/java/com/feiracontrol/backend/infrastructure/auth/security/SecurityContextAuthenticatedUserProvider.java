package com.feiracontrol.backend.infrastructure.auth.security;

import com.feiracontrol.backend.application.auth.CurrentAuthenticatedUserProvider;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import java.util.Optional;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityContextAuthenticatedUserProvider implements CurrentAuthenticatedUserProvider {

    @Override
    public Optional<AuthenticatedUser> currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return Optional.empty();
        }

        if (authentication instanceof AnonymousAuthenticationToken) {
            return Optional.empty();
        }

        if (authentication.getPrincipal() instanceof AuthenticatedUser authenticatedUser) {
            return Optional.of(authenticatedUser);
        }

        return Optional.empty();
    }
}
