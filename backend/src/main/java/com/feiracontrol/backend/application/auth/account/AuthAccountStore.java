package com.feiracontrol.backend.application.auth.account;

import java.util.Optional;

public interface AuthAccountStore {

    Optional<AuthAccount> findByEmail(String email);

    AuthAccount createOwnerAccount(NewOwnerAccount newOwnerAccount);
}
