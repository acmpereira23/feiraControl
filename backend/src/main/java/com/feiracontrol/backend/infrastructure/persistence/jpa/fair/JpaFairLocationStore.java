package com.feiracontrol.backend.infrastructure.persistence.jpa.fair;

import com.feiracontrol.backend.application.fair.FairLocationStore;
import com.feiracontrol.backend.application.fair.NewFairLocation;
import com.feiracontrol.backend.domain.fair.FairLocation;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.FairLocationJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.FairLocationJpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.TreeSet;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaFairLocationStore implements FairLocationStore {

    private final FairLocationJpaRepository fairLocationJpaRepository;

    public JpaFairLocationStore(FairLocationJpaRepository fairLocationJpaRepository) {
        this.fairLocationJpaRepository = fairLocationJpaRepository;
    }

    @Override
    public FairLocation create(NewFairLocation newFairLocation) {
        Instant now = Instant.now();

        FairLocationJpaEntity entity = new FairLocationJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(newFairLocation.name());
        entity.setCity(newFairLocation.city());
        entity.setState(newFairLocation.state());
        entity.setReference(newFairLocation.reference());
        entity.setOperatingDays(new TreeSet<>(newFairLocation.operatingDays()));
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        return toDomain(fairLocationJpaRepository.save(entity));
    }

    @Override
    public Optional<FairLocation> findById(UUID id) {
        return fairLocationJpaRepository.findById(id).map(this::toDomain);
    }

    @Override
    public List<FairLocation> list() {
        return fairLocationJpaRepository.findAllByOrderByNameAscCreatedAtDesc().stream()
            .map(this::toDomain)
            .toList();
    }

    private FairLocation toDomain(FairLocationJpaEntity entity) {
        return new FairLocation(
            entity.getId(),
            entity.getName(),
            entity.getCity(),
            entity.getState(),
            entity.getReference(),
            copyOperatingDays(entity.getOperatingDays()),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private Set<java.time.DayOfWeek> copyOperatingDays(Set<java.time.DayOfWeek> operatingDays) {
        return new TreeSet<>(operatingDays);
    }
}
