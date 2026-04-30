package com.feiracontrol.backend.application.employee;

import com.feiracontrol.backend.domain.employee.Employee;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeStore {

    Employee create(NewEmployee newEmployee);

    List<Employee> list();

    Optional<Employee> findById(UUID employeeId);
}
