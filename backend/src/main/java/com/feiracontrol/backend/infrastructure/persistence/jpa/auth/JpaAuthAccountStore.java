package com.feiracontrol.backend.infrastructure.persistence.jpa.auth;

import com.feiracontrol.backend.application.auth.account.AuthAccount;
import com.feiracontrol.backend.application.auth.account.AuthAccountStore;
import com.feiracontrol.backend.application.auth.account.NewOwnerAccount;
import com.feiracontrol.backend.application.auth.exception.AuthEmailAlreadyInUseException;
import com.feiracontrol.backend.domain.user.UserRole;
import com.feiracontrol.backend.domain.user.UserStatus;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.UserJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.UserJpaRepository;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Component;

@Component
public class JpaAuthAccountStore implements AuthAccountStore {

    private final UserJpaRepository userJpaRepository;

    public JpaAuthAccountStore(UserJpaRepository userJpaRepository) {
        this.userJpaRepository = userJpaRepository;
    }

    @Override
    public Optional<AuthAccount> findByEmail(String email) {
        return userJpaRepository.findByEmail(email)
            .map(this::toAuthAccount);
    }

    @Override
    public AuthAccount createOwnerAccount(NewOwnerAccount newOwnerAccount) {
        Instant now = Instant.now();
        UUID userId = UUID.randomUUID();

        UserJpaEntity user = new UserJpaEntity();
        user.setId(userId);
        user.setFullName(newOwnerAccount.fullName());
        user.setEmail(newOwnerAccount.email());
        user.setPasswordHash(newOwnerAccount.passwordHash());
        user.setStatus(UserStatus.ACTIVE);
        user.setRoles(Set.of(UserRole.OWNER));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        try {
            return toAuthAccount(userJpaRepository.save(user));
        } catch (DataIntegrityViolationException exception) {
            throw new AuthEmailAlreadyInUseException(newOwnerAccount.email());
        }
    }

    private AuthAccount toAuthAccount(UserJpaEntity user) {
        return new AuthAccount(
            user.getId(),
            user.getEmail(),
            user.getPasswordHash(),
            user.getStatus(),
            Set.copyOf(user.getRoles())
        );
    }
}
