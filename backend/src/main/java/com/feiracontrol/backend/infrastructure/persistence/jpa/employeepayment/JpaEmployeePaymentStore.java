package com.feiracontrol.backend.infrastructure.persistence.jpa.employeepayment;

import com.feiracontrol.backend.application.employeepayment.EmployeePaymentStore;
import com.feiracontrol.backend.application.employeepayment.NewEmployeePayment;
import com.feiracontrol.backend.domain.employee.EmployeePayment;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.EmployeePaymentJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.EmployeePaymentJpaRepository;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaEmployeePaymentStore implements EmployeePaymentStore {

    private final EmployeePaymentJpaRepository employeePaymentJpaRepository;

    public JpaEmployeePaymentStore(EmployeePaymentJpaRepository employeePaymentJpaRepository) {
        this.employeePaymentJpaRepository = employeePaymentJpaRepository;
    }

    @Override
    public EmployeePayment create(NewEmployeePayment newEmployeePayment) {
        Instant now = Instant.now();

        EmployeePaymentJpaEntity entity = new EmployeePaymentJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setEmployeeId(newEmployeePayment.employeeId());
        entity.setCashMovementId(newEmployeePayment.cashMovementId());
        entity.setAmount(newEmployeePayment.amount());
        entity.setPaidOn(newEmployeePayment.paidOn());
        entity.setNotes(newEmployeePayment.notes());
        entity.setCreatedAt(now);

        return toDomain(employeePaymentJpaRepository.save(entity));
    }

    private EmployeePayment toDomain(EmployeePaymentJpaEntity entity) {
        return new EmployeePayment(
            entity.getId(),
            entity.getEmployeeId(),
            entity.getCashMovementId(),
            entity.getAmount(),
            entity.getPaidOn(),
            entity.getNotes(),
            entity.getCreatedAt()
        );
    }
}
