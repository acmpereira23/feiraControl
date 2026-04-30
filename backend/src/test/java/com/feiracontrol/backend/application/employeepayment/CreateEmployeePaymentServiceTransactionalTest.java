package com.feiracontrol.backend.application.employeepayment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.CurrentAuthenticatedUserProvider;
import com.feiracontrol.backend.application.employeepayment.command.CreateEmployeePaymentCommand;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.EmployeeJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.CashMovementJpaRepository;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.EmployeeJpaRepository;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("e2e")
class CreateEmployeePaymentServiceTransactionalTest {

    @Autowired
    private CreateEmployeePaymentService createEmployeePaymentService;

    @Autowired
    private EmployeeJpaRepository employeeJpaRepository;

    @Autowired
    private CashMovementJpaRepository cashMovementJpaRepository;

    @MockBean
    private CurrentAuthenticatedUserProvider currentAuthenticatedUserProvider;

    @MockBean
    private EmployeePaymentStore employeePaymentStore;

    @BeforeEach
    void setUp() {
        cashMovementJpaRepository.deleteAll();
        employeeJpaRepository.deleteAll();

        given(currentAuthenticatedUserProvider.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
    }

    @Test
    void shouldRollbackGeneratedExpenseWhenPaymentPersistenceFails() {
        EmployeeJpaEntity employee = new EmployeeJpaEntity();
        employee.setId(UUID.randomUUID());
        employee.setName("Maria Clara");
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setCreatedAt(Instant.parse("2026-04-29T10:00:00Z"));
        employee.setUpdatedAt(Instant.parse("2026-04-29T10:00:00Z"));
        employeeJpaRepository.save(employee);

        given(employeePaymentStore.create(any())).willThrow(new RuntimeException("forced failure"));

        assertThatThrownBy(() -> createEmployeePaymentService.create(new CreateEmployeePaymentCommand(
            employee.getId(),
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            "Pix"
        )))
            .isInstanceOf(RuntimeException.class)
            .hasMessage("forced failure");

        assertThat(cashMovementJpaRepository.findAll()).isEmpty();
    }
}
