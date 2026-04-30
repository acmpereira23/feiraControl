package com.feiracontrol.backend;

import com.feiracontrol.backend.application.auth.CurrentAuthenticatedUserProvider;
import com.feiracontrol.backend.application.auth.account.AuthAccountStore;
import com.feiracontrol.backend.application.auth.token.TokenIssuer;
import com.feiracontrol.backend.application.cash.CashMovementStore;
import com.feiracontrol.backend.application.cash.FairLocationAccess;
import com.feiracontrol.backend.application.dashboard.DashboardSummaryStore;
import com.feiracontrol.backend.application.employee.EmployeeStore;
import com.feiracontrol.backend.application.employeepayment.EmployeePaymentStore;
import com.feiracontrol.backend.application.fair.FairLocationStore;
import com.feiracontrol.backend.application.fairclosure.FairLocationCashClosureStore;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.oauth2.jwt.JwtDecoder;

@SpringBootTest(properties = {
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration,"
        + "org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration,"
        + "org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration"
})
class FeiraControlApplicationTests {

    @MockBean
    private AuthAccountStore authAccountStore;

    @MockBean
    private TokenIssuer tokenIssuer;

    @MockBean
    private CurrentAuthenticatedUserProvider currentAuthenticatedUserProvider;

    @MockBean
    private JwtDecoder jwtDecoder;

    @MockBean
    private CashMovementStore cashMovementStore;

    @MockBean
    private FairLocationAccess fairLocationAccess;

    @MockBean
    private DashboardSummaryStore dashboardSummaryStore;

    @MockBean
    private EmployeeStore employeeStore;

    @MockBean
    private EmployeePaymentStore employeePaymentStore;

    @MockBean
    private FairLocationStore fairLocationStore;

    @MockBean
    private FairLocationCashClosureStore fairLocationCashClosureStore;

    @Test
    void contextLoads() {
    }
}
