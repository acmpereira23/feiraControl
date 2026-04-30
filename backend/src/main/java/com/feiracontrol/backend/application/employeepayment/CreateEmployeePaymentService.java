package com.feiracontrol.backend.application.employeepayment;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.cash.CashMovementStore;
import com.feiracontrol.backend.application.cash.NewCashMovement;
import com.feiracontrol.backend.application.employee.EmployeeStore;
import com.feiracontrol.backend.application.employeepayment.command.CreateEmployeePaymentCommand;
import com.feiracontrol.backend.application.employeepayment.exception.InvalidEmployeeReferenceException;
import com.feiracontrol.backend.application.employeepayment.result.EmployeePaymentView;
import com.feiracontrol.backend.domain.cash.CashMovement;
import com.feiracontrol.backend.domain.cash.CashMovementType;
import com.feiracontrol.backend.domain.employee.Employee;
import com.feiracontrol.backend.domain.employee.EmployeePayment;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

@Service
public class CreateEmployeePaymentService {

    private final AuthContextService authContextService;
    private final EmployeeStore employeeStore;
    private final CashMovementStore cashMovementStore;
    private final EmployeePaymentStore employeePaymentStore;

    public CreateEmployeePaymentService(
        AuthContextService authContextService,
        EmployeeStore employeeStore,
        CashMovementStore cashMovementStore,
        EmployeePaymentStore employeePaymentStore
    ) {
        this.authContextService = authContextService;
        this.employeeStore = employeeStore;
        this.cashMovementStore = cashMovementStore;
        this.employeePaymentStore = employeePaymentStore;
    }

    @Transactional
    public EmployeePaymentView create(CreateEmployeePaymentCommand command) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        Employee employee = employeeStore.findById(command.employeeId())
            .orElseThrow(InvalidEmployeeReferenceException::new);
        String normalizedNotes = normalize(command.notes());

        CashMovement expenseMovement = cashMovementStore.create(new NewCashMovement(
            null,
            CashMovementType.EXPENSE,
            buildExpenseDescription(employee),
            command.amount(),
            command.paidOn()
        ));

        EmployeePayment employeePayment = employeePaymentStore.create(new NewEmployeePayment(
            employee.id(),
            expenseMovement.id(),
            command.amount(),
            command.paidOn(),
            normalizedNotes
        ));

        return new EmployeePaymentView(
            employeePayment.id(),
            employeePayment.employeeId(),
            employeePayment.cashMovementId(),
            employeePayment.amount(),
            employeePayment.paidOn(),
            employeePayment.notes(),
            employeePayment.createdAt()
        );
    }

    private String buildExpenseDescription(Employee employee) {
        return "Pagamento de funcionario: " + employee.name();
    }

    private String normalize(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}
