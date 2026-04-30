package com.feiracontrol.backend.application.employee;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.domain.auth.AuthenticatedUser;
import com.feiracontrol.backend.domain.auth.AuthenticationScheme;
import com.feiracontrol.backend.domain.employee.Employee;
import com.feiracontrol.backend.domain.employee.EmployeeStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ListEmployeesServiceTest {

    @Mock
    private AuthContextService authContextService;

    @Mock
    private EmployeeStore employeeStore;

    @InjectMocks
    private ListEmployeesService listEmployeesService;

    @Test
    void shouldListEmployeesForAuthenticatedUser() {
        UUID employeeId = UUID.randomUUID();

        given(authContextService.currentUser()).willReturn(Optional.of(new AuthenticatedUser(
            UUID.randomUUID(),
            "owner@feira.com",
            Set.of("OWNER"),
            AuthenticationScheme.JWT
        )));
        given(employeeStore.list()).willReturn(List.of(new Employee(
            employeeId,
            "Maria Clara",
            null,
            "Caixa",
            new BigDecimal("120.00"),
            LocalDate.of(2026, 4, 29),
            EmployeeStatus.ACTIVE,
            Instant.parse("2026-04-29T10:00:00Z"),
            Instant.parse("2026-04-29T10:00:00Z")
        )));

        var result = listEmployeesService.list();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().id()).isEqualTo(employeeId);
        assertThat(result.getFirst().name()).isEqualTo("Maria Clara");
    }
}
