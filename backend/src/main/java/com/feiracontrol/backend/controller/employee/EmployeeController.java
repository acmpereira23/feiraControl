package com.feiracontrol.backend.controller.employee;

import com.feiracontrol.backend.application.employee.CreateEmployeeService;
import com.feiracontrol.backend.application.employee.ListEmployeesService;
import com.feiracontrol.backend.application.employee.command.CreateEmployeeCommand;
import com.feiracontrol.backend.application.employee.result.EmployeeView;
import com.feiracontrol.backend.controller.employee.dto.CreateEmployeeRequest;
import com.feiracontrol.backend.controller.employee.dto.EmployeeResponse;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final CreateEmployeeService createEmployeeService;
    private final ListEmployeesService listEmployeesService;

    public EmployeeController(
        CreateEmployeeService createEmployeeService,
        ListEmployeesService listEmployeesService
    ) {
        this.createEmployeeService = createEmployeeService;
        this.listEmployeesService = listEmployeesService;
    }

    @PostMapping
    public EmployeeResponse create(@Valid @RequestBody CreateEmployeeRequest request) {
        return toResponse(createEmployeeService.create(new CreateEmployeeCommand(
            request.name(),
            request.documentNumber(),
            request.role(),
            request.defaultDailyRate(),
            request.hiredOn(),
            request.status()
        )));
    }

    @GetMapping
    public List<EmployeeResponse> list() {
        return listEmployeesService.list().stream()
            .map(this::toResponse)
            .toList();
    }

    private EmployeeResponse toResponse(EmployeeView employee) {
        return new EmployeeResponse(
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
