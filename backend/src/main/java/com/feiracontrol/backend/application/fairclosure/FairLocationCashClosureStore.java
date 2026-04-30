package com.feiracontrol.backend.application.fairclosure;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface FairLocationCashClosureStore {

    FairLocationCashClosureMetrics summarize(
        UUID fairLocationId,
        Optional<LocalDate> startDate,
        Optional<LocalDate> endDate
    );
}
