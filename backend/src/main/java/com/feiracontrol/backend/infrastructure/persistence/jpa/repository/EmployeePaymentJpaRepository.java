package com.feiracontrol.backend.infrastructure.persistence.jpa.repository;

import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.EmployeePaymentJpaEntity;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeePaymentJpaRepository extends JpaRepository<EmployeePaymentJpaEntity, UUID> {
}
