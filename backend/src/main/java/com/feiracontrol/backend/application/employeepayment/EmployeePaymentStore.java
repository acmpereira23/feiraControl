package com.feiracontrol.backend.application.employeepayment;

import com.feiracontrol.backend.domain.employee.EmployeePayment;

public interface EmployeePaymentStore {

    EmployeePayment create(NewEmployeePayment newEmployeePayment);
}
