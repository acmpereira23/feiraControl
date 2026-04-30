package com.feiracontrol.backend.application.auth;

import com.feiracontrol.backend.application.auth.account.AuthAccount;
import com.feiracontrol.backend.application.auth.account.AuthAccountStore;
import com.feiracontrol.backend.application.auth.account.NewOwnerAccount;
import com.feiracontrol.backend.application.auth.command.RegisterCommand;
import com.feiracontrol.backend.application.auth.credential.CredentialHasher;
import com.feiracontrol.backend.application.auth.exception.AuthEmailAlreadyInUseException;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import com.feiracontrol.backend.application.auth.result.AuthTokenResult;
import com.feiracontrol.backend.application.auth.token.TokenIssuer;
import com.feiracontrol.backend.application.auth.token.TokenPayload;
import jakarta.transaction.Transactional;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RegisterService {

    private final AuthAccountStore authAccountStore;
    private final CredentialHasher credentialHasher;
    private final TokenIssuer tokenIssuer;

    public RegisterService(
        AuthAccountStore authAccountStore,
        CredentialHasher credentialHasher,
        TokenIssuer tokenIssuer
    ) {
        this.authAccountStore = authAccountStore;
        this.credentialHasher = credentialHasher;
        this.tokenIssuer = tokenIssuer;
    }

    @Transactional
    public AuthTokenResult register(RegisterCommand command) {
        String normalizedEmail = normalizeEmail(command.email());

        if (authAccountStore.findByEmail(normalizedEmail).isPresent()) {
            throw new AuthEmailAlreadyInUseException(normalizedEmail);
        }

        AuthAccount account = authAccountStore.createOwnerAccount(new NewOwnerAccount(
            command.fullName().trim(),
            normalizedEmail,
            credentialHasher.hash(command.password())
        ));

        Set<String> authorities = account.roles().stream()
            .map(Enum::name)
            .collect(java.util.stream.Collectors.toUnmodifiableSet());

        String accessToken = tokenIssuer.issue(new TokenPayload(
            account.userId(),
            account.email(),
            authorities
        ));

        return new AuthTokenResult(
            accessToken,
            "Bearer",
            tokenIssuer.expiresInSeconds(),
            new AuthSessionView(account.userId(), account.email(), authorities)
        );
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
