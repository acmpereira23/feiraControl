package com.feiracontrol.backend.infrastructure.persistence.jpa.repository;

import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.UserJpaEntity;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserJpaRepository extends JpaRepository<UserJpaEntity, UUID> {

    Optional<UserJpaEntity> findByEmail(String email);
}
