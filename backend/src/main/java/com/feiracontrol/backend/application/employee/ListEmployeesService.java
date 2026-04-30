package com.feiracontrol.backend.application.employee;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.employee.result.EmployeeView;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListEmployeesService {

    private final AuthContextService authContextService;
    private final EmployeeStore employeeStore;

    public ListEmployeesService(AuthContextService authContextService, EmployeeStore employeeStore) {
        this.authContextService = authContextService;
        this.employeeStore = employeeStore;
    }

    public List<EmployeeView> list() {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        return employeeStore.list().stream()
            .map(employee -> new EmployeeView(
                employee.id(),
                employee.name(),
                employee.documentNumber(),
                employee.role(),
                employee.defaultDailyRate(),
                employee.hiredOn(),
                employee.status(),
                employee.createdAt(),
                employee.updatedAt()
            ))
            .toList();
    }
}
