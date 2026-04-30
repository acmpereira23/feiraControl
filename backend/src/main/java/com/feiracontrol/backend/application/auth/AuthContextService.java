package com.feiracontrol.backend.application.auth;

import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class AuthContextService {

    private final CurrentAuthenticatedUserProvider currentAuthenticatedUserProvider;

    public AuthContextService(CurrentAuthenticatedUserProvider currentAuthenticatedUserProvider) {
        this.currentAuthenticatedUserProvider = currentAuthenticatedUserProvider;
    }

    public Optional<AuthenticatedUser> currentUser() {
        return currentAuthenticatedUserProvider.currentUser();
    }
}
