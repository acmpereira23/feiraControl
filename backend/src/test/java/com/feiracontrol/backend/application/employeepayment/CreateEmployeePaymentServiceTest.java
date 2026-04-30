package com.feiracontrol.backend.application.employeepayment;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.cash.CashMovementStore;
import com.feiracontrol.backend.application.employee.EmployeeStore;
import com.feiracontrol.backend.application.employeepayment.command.CreateEmployeePaymentCommand;
import com.feiracontrol.backend.application.employeepayment.exception.InvalidEmployeeReferenceException;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.cash.CashMovement;
import com.feiracontrol.backend.domain.cash.CashMovementType;
import com.feiracontrol.backend.domain.employee.Employee;
import com.feiracontrol.backend.domain.employee.EmployeePayment;
import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CreateEmployeePaymentServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private EmployeeStore employeeStore;

    @Mock
    private CashMovementStore cashMovementStore;

    @Mock
    private EmployeePaymentStore employeePaymentStore;

    @InjectMocks
    private CreateEmployeePaymentService createEmployeePaymentService;

    @Test
    void shouldCreateEmployeePaymentAndExpenseForAuthenticatedUser() {
        UUID employeeId = UUID.randomUUID();
        UUID expenseId = UUID.randomUUID();
        UUID paymentId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(employeeStore.findById(employeeId)).willReturn(Optional.of(new Employee(
            employeeId,
            "Maria Clara",
            "12345678900",
            "Caixa",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 20),
            EmployeeStatus.ACTIVE,
            Instant.parse("2026-04-20T10:00:00Z"),
            Instant.parse("2026-04-20T10:00:00Z")
        )));
        given(cashMovementStore.create(any())).willReturn(new CashMovement(
            expenseId,
            null,
            CashMovementType.EXPENSE,
            "Pagamento de funcionario: Maria Clara",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        ));
        given(employeePaymentStore.create(any())).willReturn(new EmployeePayment(
            paymentId,
            employeeId,
            expenseId,
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            "Pix",
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        var result = createEmployeePaymentService.create(new CreateEmployeePaymentCommand(
            employeeId,
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            "  Pix  "
        ));

        assertThat(result.id()).isEqualTo(paymentId);
        assertThat(result.employeeId()).isEqualTo(employeeId);
        assertThat(result.cashMovementId()).isEqualTo(expenseId);
        assertThat(result.notes()).isEqualTo("Pix");
        verify(cashMovementStore).create(any());
        verify(employeePaymentStore).create(any());
    }

    @Test
    void shouldRejectUnknownEmployeeReference() {
        UUID employeeId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(employeeStore.findById(employeeId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> createEmployeePaymentService.create(new CreateEmployeePaymentCommand(
            employeeId,
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            null
        )))
            .isInstanceOf(InvalidEmployeeReferenceException.class);

        verifyNoInteractions(cashMovementStore);
        verifyNoInteractions(employeePaymentStore);
    }

    @Test
    void shouldRejectUnauthenticatedAccess() {
        UUID employeeId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.empty());

        assertThatThrownBy(() -> createEmployeePaymentService.create(new CreateEmployeePaymentCommand(
            employeeId,
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            null
        )))
            .isInstanceOf(UnauthenticatedAccessException.class);

        verifyNoInteractions(employeeStore);
        verifyNoInteractions(cashMovementStore);
        verifyNoInteractions(employeePaymentStore);
    }
}
