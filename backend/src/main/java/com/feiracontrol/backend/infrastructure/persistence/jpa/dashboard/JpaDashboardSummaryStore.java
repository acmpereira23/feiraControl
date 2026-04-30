package com.feiracontrol.backend.infrastructure.persistence.jpa.dashboard;

import com.feiracontrol.backend.application.dashboard.DayPerformanceSummary;
import com.feiracontrol.backend.application.dashboard.DashboardSummaryStore;
import com.feiracontrol.backend.application.dashboard.FinancialDashboardSummary;
import com.feiracontrol.backend.application.dashboard.LocationPerformanceSummary;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.CashMovementJpaRepository;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Component;

@Component
public class JpaDashboardSummaryStore implements DashboardSummaryStore {

    private final CashMovementJpaRepository cashMovementJpaRepository;

    public JpaDashboardSummaryStore(CashMovementJpaRepository cashMovementJpaRepository) {
        this.cashMovementJpaRepository = cashMovementJpaRepository;
    }

    @Override
    public FinancialDashboardSummary summarize(
        Optional<LocalDate> startDate,
        Optional<LocalDate> endDate
    ) {
        var projection = switch (resolveRangeMode(startDate, endDate)) {
            case ALL -> cashMovementJpaRepository.summarize();
            case START_ONLY -> cashMovementJpaRepository.summarizeByOccurredOnGreaterThanEqual(
                startDate.orElseThrow()
            );
            case END_ONLY -> cashMovementJpaRepository.summarizeByOccurredOnLessThanEqual(
                endDate.orElseThrow()
            );
            case BETWEEN -> cashMovementJpaRepository.summarizeByOccurredOnBetween(
                startDate.orElseThrow(),
                endDate.orElseThrow()
            );
        };
        List<DayPerformanceSummary> byDay = switch (resolveRangeMode(startDate, endDate)) {
            case ALL -> cashMovementJpaRepository.summarizeByDay().stream().map(this::toDaySummary).toList();
            case START_ONLY -> cashMovementJpaRepository.summarizeByDayOccurredOnGreaterThanEqual(
                startDate.orElseThrow()
            ).stream().map(this::toDaySummary).toList();
            case END_ONLY -> cashMovementJpaRepository.summarizeByDayOccurredOnLessThanEqual(
                endDate.orElseThrow()
            ).stream().map(this::toDaySummary).toList();
            case BETWEEN -> cashMovementJpaRepository.summarizeByDayOccurredOnBetween(
                startDate.orElseThrow(),
                endDate.orElseThrow()
            ).stream().map(this::toDaySummary).toList();
        };
        List<LocationPerformanceSummary> byLocation = switch (resolveRangeMode(startDate, endDate)) {
            case ALL -> cashMovementJpaRepository.summarizeByLocation().stream().map(this::toLocationSummary).toList();
            case START_ONLY -> cashMovementJpaRepository.summarizeByLocationOccurredOnGreaterThanEqual(
                startDate.orElseThrow()
            ).stream().map(this::toLocationSummary).toList();
            case END_ONLY -> cashMovementJpaRepository.summarizeByLocationOccurredOnLessThanEqual(
                endDate.orElseThrow()
            ).stream().map(this::toLocationSummary).toList();
            case BETWEEN -> cashMovementJpaRepository.summarizeByLocationOccurredOnBetween(
                startDate.orElseThrow(),
                endDate.orElseThrow()
            ).stream().map(this::toLocationSummary).toList();
        };

        BigDecimal totalIncome = projection != null && projection.getTotalIncome() != null
            ? projection.getTotalIncome()
            : BigDecimal.ZERO;
        BigDecimal totalExpense = projection != null && projection.getTotalExpense() != null
            ? projection.getTotalExpense()
            : BigDecimal.ZERO;

        return new FinancialDashboardSummary(
            totalIncome,
            totalExpense,
            totalIncome.subtract(totalExpense),
            startDate.orElse(null),
            endDate.orElse(null),
            byDay,
            byLocation
        );
    }

    private DayPerformanceSummary toDaySummary(CashMovementJpaRepository.DayPerformanceProjection projection) {
        BigDecimal totalIncome = projection.getTotalIncome() != null ? projection.getTotalIncome() : BigDecimal.ZERO;
        BigDecimal totalExpense = projection.getTotalExpense() != null ? projection.getTotalExpense() : BigDecimal.ZERO;

        return new DayPerformanceSummary(
            DayOfWeek.of(projection.getDayOfWeek()),
            totalIncome,
            totalExpense,
            totalIncome.subtract(totalExpense),
            projection.getMovementCount() != null ? projection.getMovementCount() : 0L
        );
    }

    private LocationPerformanceSummary toLocationSummary(CashMovementJpaRepository.LocationPerformanceProjection projection) {
        BigDecimal totalIncome = projection.getTotalIncome() != null ? projection.getTotalIncome() : BigDecimal.ZERO;
        BigDecimal totalExpense = projection.getTotalExpense() != null ? projection.getTotalExpense() : BigDecimal.ZERO;

        return new LocationPerformanceSummary(
            projection.getFairLocationId(),
            projection.getFairLocationName(),
            projection.getCity(),
            projection.getState(),
            totalIncome,
            totalExpense,
            totalIncome.subtract(totalExpense),
            projection.getMovementCount() != null ? projection.getMovementCount() : 0L
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
