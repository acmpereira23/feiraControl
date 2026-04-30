package com.feiracontrol.backend.application.employee;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.employee.command.CreateEmployeeCommand;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.employee.Employee;
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
class CreateEmployeeServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private EmployeeStore employeeStore;

    @InjectMocks
    private CreateEmployeeService createEmployeeService;

    @Test
    void shouldCreateEmployeeForAuthenticatedUser() {
        UUID employeeId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(employeeStore.create(any())).willReturn(new Employee(
            employeeId,
            "Maria Clara",
            "12345678900",
            "Caixa",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            EmployeeStatus.ACTIVE,
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        ));

        var result = createEmployeeService.create(new CreateEmployeeCommand(
            "  Maria Clara  ",
            " 12345678900 ",
            " Caixa ",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            EmployeeStatus.ACTIVE
        ));

        assertThat(result.id()).isEqualTo(employeeId);
        assertThat(result.name()).isEqualTo("Maria Clara");
        assertThat(result.documentNumber()).isEqualTo("12345678900");
        assertThat(result.role()).isEqualTo("Caixa");
        verify(employeeStore).create(any());
    }
}
