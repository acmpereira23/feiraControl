package com.feiracontrol.backend.infrastructure.persistence.jpa.cash;

import com.feiracontrol.backend.application.cash.FairLocationAccess;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.FairLocationJpaRepository;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaFairLocationAccess implements FairLocationAccess {

    private final FairLocationJpaRepository fairLocationJpaRepository;

    public JpaFairLocationAccess(FairLocationJpaRepository fairLocationJpaRepository) {
        this.fairLocationJpaRepository = fairLocationJpaRepository;
    }

    @Override
    public boolean existsById(UUID fairLocationId) {
        return fairLocationJpaRepository.existsById(fairLocationId);
    }
}
