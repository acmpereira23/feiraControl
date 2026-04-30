package com.feiracontrol.backend.infrastructure.persistence.jpa.repository;

import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.EmployeeJpaEntity;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeJpaRepository extends JpaRepository<EmployeeJpaEntity, UUID> {

    List<EmployeeJpaEntity> findAllByOrderByNameAscCreatedAtDesc();
}
