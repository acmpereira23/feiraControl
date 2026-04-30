package com.feiracontrol.backend.application.auth;

import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import java.util.Optional;

public interface CurrentAuthenticatedUserProvider {

    Optional<AuthenticatedUser> currentUser();
}
