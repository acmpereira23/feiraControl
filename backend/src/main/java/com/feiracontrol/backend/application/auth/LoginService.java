package com.feiracontrol.backend.application.auth;

import com.feiracontrol.backend.application.auth.account.AuthAccount;
import com.feiracontrol.backend.application.auth.account.AuthAccountStore;
import com.feiracontrol.backend.application.auth.command.LoginCommand;
import com.feiracontrol.backend.application.auth.credential.CredentialHasher;
import com.feiracontrol.backend.application.auth.exception.InvalidCredentialsException;
import com.feiracontrol.backend.application.auth.result.AuthSessionView;
import com.feiracontrol.backend.application.auth.result.AuthTokenResult;
import com.feiracontrol.backend.application.auth.token.TokenIssuer;
import com.feiracontrol.backend.application.auth.token.TokenPayload;
import com.feiracontrol.backend.domain.user.UserStatus;
import java.util.Locale;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class LoginService {

    private final AuthAccountStore authAccountStore;
    private final CredentialHasher credentialHasher;
    private final TokenIssuer tokenIssuer;

    public LoginService(
        AuthAccountStore authAccountStore,
        CredentialHasher credentialHasher,
        TokenIssuer tokenIssuer
    ) {
        this.authAccountStore = authAccountStore;
        this.credentialHasher = credentialHasher;
        this.tokenIssuer = tokenIssuer;
    }

    public AuthTokenResult login(LoginCommand command) {
        String normalizedEmail = normalizeEmail(command.email());
        AuthAccount account = authAccountStore.findByEmail(normalizedEmail)
            .filter(found -> found.status() == UserStatus.ACTIVE)
            .orElseThrow(InvalidCredentialsException::new);

        if (!credentialHasher.matches(command.password(), account.passwordHash())) {
            throw new InvalidCredentialsException();
        }

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
