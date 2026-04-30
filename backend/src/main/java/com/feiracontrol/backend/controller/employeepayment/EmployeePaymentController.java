package com.feiracontrol.backend.controller.employeepayment;

import com.feiracontrol.backend.application.employeepayment.CreateEmployeePaymentService;
import com.feiracontrol.backend.application.employeepayment.command.CreateEmployeePaymentCommand;
import com.feiracontrol.backend.application.employeepayment.result.EmployeePaymentView;
import com.feiracontrol.backend.controller.employeepayment.dto.CreateEmployeePaymentRequest;
import com.feiracontrol.backend.controller.employeepayment.dto.EmployeePaymentResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/employee-payments")
public class EmployeePaymentController {

    private final CreateEmployeePaymentService createEmployeePaymentService;

    public EmployeePaymentController(CreateEmployeePaymentService createEmployeePaymentService) {
        this.createEmployeePaymentService = createEmployeePaymentService;
    }

    @PostMapping
    public EmployeePaymentResponse create(@Valid @RequestBody CreateEmployeePaymentRequest request) {
        return toResponse(createEmployeePaymentService.create(new CreateEmployeePaymentCommand(
            request.employeeId(),
            request.amount(),
            request.paidOn(),
            request.notes()
        )));
    }

    private EmployeePaymentResponse toResponse(EmployeePaymentView payment) {
        return new EmployeePaymentResponse(
            payment.id(),
            payment.employeeId(),
            payment.cashMovementId(),
            payment.amount(),
            payment.paidOn(),
            payment.notes(),
            payment.createdAt()
        );
    }
}
