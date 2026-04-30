package com.feiracontrol.backend.application.fairclosure;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.fair.FairLocationStore;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureDateRangeException;
import com.feiracontrol.backend.application.fairclosure.exception.InvalidFairLocationCashClosureReferenceException;
import com.feiracontrol.backend.application.fairclosure.query.GetFairLocationCashClosureQuery;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class GetFairLocationCashClosureService {

    private final AuthContextService authContextService;
    private final FairLocationStore fairLocationStore;
    private final FairLocationCashClosureStore fairLocationCashClosureStore;

    public GetFairLocationCashClosureService(
        AuthContextService authContextService,
        FairLocationStore fairLocationStore,
        FairLocationCashClosureStore fairLocationCashClosureStore
    ) {
        this.authContextService = authContextService;
        this.fairLocationStore = fairLocationStore;
        this.fairLocationCashClosureStore = fairLocationCashClosureStore;
    }

    public FairLocationCashClosureSummary get(GetFairLocationCashClosureQuery query) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        if (query.startDate() != null && query.endDate() != null && query.startDate().isAfter(query.endDate())) {
            throw new InvalidFairLocationCashClosureDateRangeException();
        }

        var fairLocation = fairLocationStore.findById(query.fairLocationId())
            .orElseThrow(InvalidFairLocationCashClosureReferenceException::new);

        FairLocationCashClosureMetrics metrics = fairLocationCashClosureStore.summarize(
            query.fairLocationId(),
            Optional.ofNullable(query.startDate()),
            Optional.ofNullable(query.endDate())
        );

        return new FairLocationCashClosureSummary(
            fairLocation.id(),
            fairLocation.name(),
            fairLocation.city(),
            fairLocation.state(),
            query.startDate(),
            query.endDate(),
            metrics.totalIncome(),
            metrics.totalExpense(),
            metrics.profit(),
            metrics.movementCount()
        );
    }
}
