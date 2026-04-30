package com.feiracontrol.backend.application.auth;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.feiracontrol.backend.application.auth.account.AuthAccount;
import com.feiracontrol.backend.application.auth.account.AuthAccountStore;
import com.feiracontrol.backend.application.auth.command.RegisterCommand;
import com.feiracontrol.backend.application.auth.credential.CredentialHasher;
import com.feiracontrol.backend.application.auth.exception.AuthEmailAlreadyInUseException;
import com.feiracontrol.backend.application.auth.token.TokenIssuer;
import com.feiracontrol.backend.domain.user.UserRole;
import com.feiracontrol.backend.domain.user.UserStatus;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RegisterServiceTest {

    @Mock
    private AuthAccountStore authAccountStore;

    @Mock
    private CredentialHasher credentialHasher;

    @Mock
    private TokenIssuer tokenIssuer;

    @InjectMocks
    private RegisterService registerService;

    @Test
    void shouldCreateOwnerAccountAndIssueToken() {
        UUID userId = UUID.randomUUID();

        given(authAccountStore.findByEmail("owner@feira.com")).willReturn(Optional.empty());
        given(credentialHasher.hash("password123")).willReturn("hashed-password");
        given(authAccountStore.createOwnerAccount(any())).willReturn(new AuthAccount(
            userId,
            "owner@feira.com",
            "hashed-password",
            UserStatus.ACTIVE,
            Set.of(UserRole.OWNER)
        ));
        given(tokenIssuer.issue(any())).willReturn("jwt-token");
        given(tokenIssuer.expiresInSeconds()).willReturn(3600L);

        var result = registerService.register(new RegisterCommand(
            "Owner",
            "OWNER@FEIRA.COM",
            "password123"
        ));

        assertThat(result.accessToken()).isEqualTo("jwt-token");
        assertThat(result.session().userId()).isEqualTo(userId);
        assertThat(result.session().email()).isEqualTo("owner@feira.com");
        assertThat(result.session().authorities()).containsExactly("OWNER");
        verify(authAccountStore).createOwnerAccount(any());
    }

    @Test
    void shouldRejectDuplicatedEmail() {
        given(authAccountStore.findByEmail("owner@feira.com")).willReturn(Optional.of(new AuthAccount(
            UUID.randomUUID(),
            "owner@feira.com",
            "hashed",
            UserStatus.ACTIVE,
            Set.of(UserRole.OWNER)
        )));

        assertThatThrownBy(() -> registerService.register(new RegisterCommand(
            "Owner",
            "owner@feira.com",
            "password123"
        )))
            .isInstanceOf(AuthEmailAlreadyInUseException.class);
    }
}
