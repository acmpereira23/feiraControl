package com.feiracontrol.backend.application.employee;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.employee.command.CreateEmployeeCommand;
import com.feiracontrol.backend.application.employee.result.EmployeeView;
import com.feiracontrol.backend.domain.employee.Employee;
import org.springframework.stereotype.Service;

@Service
public class CreateEmployeeService {

    private final AuthContextService authContextService;
    private final EmployeeStore employeeStore;

    public CreateEmployeeService(AuthContextService authContextService, EmployeeStore employeeStore) {
        this.authContextService = authContextService;
        this.employeeStore = employeeStore;
    }

    public EmployeeView create(CreateEmployeeCommand command) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        Employee employee = employeeStore.create(new NewEmployee(
            command.name().trim(),
            trimToNull(command.documentNumber()),
            trimToNull(command.role()),
            command.defaultDailyRate(),
            command.hiredOn(),
            command.status()
        ));

        return toView(employee);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private EmployeeView toView(Employee employee) {
        return new EmployeeView(
            employee.id(),
            employee.name(),
            employee.documentNumber(),
            employee.role(),
            employee.defaultDailyRate(),
            employee.hiredOn(),
            employee.status(),
            employee.createdAt(),
            employee.updatedAt()
        );
    }
}
