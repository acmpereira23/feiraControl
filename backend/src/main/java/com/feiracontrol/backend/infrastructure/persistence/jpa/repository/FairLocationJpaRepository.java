package com.feiracontrol.backend.infrastructure.persistence.jpa.repository;

import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.FairLocationJpaEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FairLocationJpaRepository extends JpaRepository<FairLocationJpaEntity, UUID> {

    @EntityGraph(attributePaths = "operatingDays")
    List<FairLocationJpaEntity> findAllByOrderByNameAscCreatedAtDesc();
}
