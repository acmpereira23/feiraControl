package com.feiracontrol.backend.application.auth;

import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import org.springframework.stereotype.Service;

@Service
public class SessionService {

    private final AuthContextService authContextService;

    public SessionService(AuthContextService authContextService) {
        this.authContextService = authContextService;
    }

    public AuthSessionView currentSession() {
        return authContextService.currentUser()
            .map(user -> new AuthSessionView(
                user.userId(),
                user.email(),
                user.authorities()
            ))
            .orElseThrow(UnauthenticatedAccessException::new);
    }
}
