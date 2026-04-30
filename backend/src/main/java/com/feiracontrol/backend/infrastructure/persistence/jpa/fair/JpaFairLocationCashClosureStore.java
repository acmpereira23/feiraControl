package com.feiracontrol.backend.infrastructure.persistence.jpa.fair;

import com.feiracontrol.backend.application.fairclosure.FairLocationCashClosureMetrics;
import com.feiracontrol.backend.application.fairclosure.FairLocationCashClosureStore;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.CashMovementJpaRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaFairLocationCashClosureStore implements FairLocationCashClosureStore {

    private final CashMovementJpaRepository cashMovementJpaRepository;

    public JpaFairLocationCashClosureStore(CashMovementJpaRepository cashMovementJpaRepository) {
        this.cashMovementJpaRepository = cashMovementJpaRepository;
    }

    @Override
    public FairLocationCashClosureMetrics summarize(
        UUID fairLocationId,
        Optional<LocalDate> startDate,
        Optional<LocalDate> endDate
    ) {
        var projection = switch (resolveRangeMode(startDate, endDate)) {
            case ALL -> cashMovementJpaRepository.summarizeClosureByFairLocationId(fairLocationId);
            case START_ONLY -> cashMovementJpaRepository.summarizeClosureByFairLocationIdOccurredOnGreaterThanEqual(
                fairLocationId,
                startDate.orElseThrow()
            );
            case END_ONLY -> cashMovementJpaRepository.summarizeClosureByFairLocationIdOccurredOnLessThanEqual(
                fairLocationId,
                endDate.orElseThrow()
            );
            case BETWEEN -> cashMovementJpaRepository.summarizeClosureByFairLocationIdOccurredOnBetween(
                fairLocationId,
                startDate.orElseThrow(),
                endDate.orElseThrow()
            );
        };

        BigDecimal totalIncome = projection != null && projection.getTotalIncome() != null
            ? projection.getTotalIncome()
            : BigDecimal.ZERO;
        BigDecimal totalExpense = projection != null && projection.getTotalExpense() != null
            ? projection.getTotalExpense()
            : BigDecimal.ZERO;

        return new FairLocationCashClosureMetrics(
            totalIncome,
            totalExpense,
            totalIncome.subtract(totalExpense),
            projection != null && projection.getMovementCount() != null ? projection.getMovementCount() : 0L
        );
    }

    private RangeMode resolveRangeMode(Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        if (startDate.isPresent() && endDate.isPresent()) {
            return RangeMode.BETWEEN;
        }
        if (startDate.isPresent()) {
            return RangeMode.START_ONLY;
        }
        if (endDate.isPresent()) {
            return RangeMode.END_ONLY;
        }
        return RangeMode.ALL;
    }

    private enum RangeMode {
        ALL,
        START_ONLY,
        END_ONLY,
        BETWEEN
    }
}
