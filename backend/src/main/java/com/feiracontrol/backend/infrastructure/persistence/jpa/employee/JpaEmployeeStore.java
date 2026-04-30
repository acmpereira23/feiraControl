package com.feiracontrol.backend.infrastructure.persistence.jpa.employee;

import com.feiracontrol.backend.application.employee.EmployeeStore;
import com.feiracontrol.backend.application.employee.NewEmployee;
import com.feiracontrol.backend.domain.employee.Employee;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.EmployeeJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.EmployeeJpaRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaEmployeeStore implements EmployeeStore {

    private final EmployeeJpaRepository employeeJpaRepository;

    public JpaEmployeeStore(EmployeeJpaRepository employeeJpaRepository) {
        this.employeeJpaRepository = employeeJpaRepository;
    }

    @Override
    public Employee create(NewEmployee newEmployee) {
        Instant now = Instant.now();

        EmployeeJpaEntity entity = new EmployeeJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setName(newEmployee.name());
        entity.setDocumentNumber(newEmployee.documentNumber());
        entity.setRole(newEmployee.role());
        entity.setDefaultDailyRate(newEmployee.defaultDailyRate());
        entity.setHiredOn(newEmployee.hiredOn());
        entity.setStatus(newEmployee.status());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        return toDomain(employeeJpaRepository.save(entity));
    }

    @Override
    public List<Employee> list() {
        return employeeJpaRepository.findAllByOrderByNameAscCreatedAtDesc().stream()
            .map(this::toDomain)
            .toList();
    }

    @Override
    public Optional<Employee> findById(UUID employeeId) {
        return employeeJpaRepository.findById(employeeId)
            .map(this::toDomain);
    }

    private Employee toDomain(EmployeeJpaEntity entity) {
        return new Employee(
            entity.getId(),
            entity.getName(),
            entity.getDocumentNumber(),
            entity.getRole(),
            entity.getDefaultDailyRate(),
            entity.getHiredOn(),
            entity.getStatus(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }
}
