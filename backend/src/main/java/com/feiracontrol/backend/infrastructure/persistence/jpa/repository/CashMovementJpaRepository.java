package com.feiracontrol.backend.infrastructure.persistence.jpa.repository;

import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.CashMovementJpaEntity;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CashMovementJpaRepository extends JpaRepository<CashMovementJpaEntity, UUID> {

    List<CashMovementJpaEntity> findAllByOrderByOccurredOnDescCreatedAtDesc();

    List<CashMovementJpaEntity> findAllByOccurredOnGreaterThanEqualOrderByOccurredOnDescCreatedAtDesc(
        LocalDate startDate
    );

    List<CashMovementJpaEntity> findAllByOccurredOnLessThanEqualOrderByOccurredOnDescCreatedAtDesc(
        LocalDate endDate
    );

    List<CashMovementJpaEntity> findAllByOccurredOnBetweenOrderByOccurredOnDescCreatedAtDesc(
        LocalDate startDate,
        LocalDate endDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where fair_location_id = :fairLocationId
        """, nativeQuery = true)
    CashClosureProjection summarizeClosureByFairLocationId(
        @org.springframework.data.repository.query.Param("fairLocationId") UUID fairLocationId
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where fair_location_id = :fairLocationId
          and occurred_on >= :startDate
        """, nativeQuery = true)
    CashClosureProjection summarizeClosureByFairLocationIdOccurredOnGreaterThanEqual(
        @org.springframework.data.repository.query.Param("fairLocationId") UUID fairLocationId,
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where fair_location_id = :fairLocationId
          and occurred_on <= :endDate
        """, nativeQuery = true)
    CashClosureProjection summarizeClosureByFairLocationIdOccurredOnLessThanEqual(
        @org.springframework.data.repository.query.Param("fairLocationId") UUID fairLocationId,
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where fair_location_id = :fairLocationId
          and occurred_on between :startDate and :endDate
        """, nativeQuery = true)
    CashClosureProjection summarizeClosureByFairLocationIdOccurredOnBetween(
        @org.springframework.data.repository.query.Param("fairLocationId") UUID fairLocationId,
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense
        from cash_movement
        """, nativeQuery = true)
    DashboardSummaryProjection summarize();

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense
        from cash_movement
        where occurred_on >= :startDate
        """, nativeQuery = true)
    DashboardSummaryProjection summarizeByOccurredOnGreaterThanEqual(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense
        from cash_movement
        where occurred_on <= :endDate
        """, nativeQuery = true)
    DashboardSummaryProjection summarizeByOccurredOnLessThanEqual(
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense
        from cash_movement
        where occurred_on between :startDate and :endDate
        """, nativeQuery = true)
    DashboardSummaryProjection summarizeByOccurredOnBetween(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            cast(extract(isodow from occurred_on) as integer) as dayOfWeek,
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        group by extract(isodow from occurred_on)
        order by extract(isodow from occurred_on)
        """, nativeQuery = true)
    List<DayPerformanceProjection> summarizeByDay();

    @Query(value = """
        select
            cast(extract(isodow from occurred_on) as integer) as dayOfWeek,
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where occurred_on >= :startDate
        group by extract(isodow from occurred_on)
        order by extract(isodow from occurred_on)
        """, nativeQuery = true)
    List<DayPerformanceProjection> summarizeByDayOccurredOnGreaterThanEqual(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate
    );

    @Query(value = """
        select
            cast(extract(isodow from occurred_on) as integer) as dayOfWeek,
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where occurred_on <= :endDate
        group by extract(isodow from occurred_on)
        order by extract(isodow from occurred_on)
        """, nativeQuery = true)
    List<DayPerformanceProjection> summarizeByDayOccurredOnLessThanEqual(
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            cast(extract(isodow from occurred_on) as integer) as dayOfWeek,
            coalesce(sum(case when type = 'INCOME' then amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when type = 'EXPENSE' then amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement
        where occurred_on between :startDate and :endDate
        group by extract(isodow from occurred_on)
        order by extract(isodow from occurred_on)
        """, nativeQuery = true)
    List<DayPerformanceProjection> summarizeByDayOccurredOnBetween(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            cm.fair_location_id as fairLocationId,
            fl.name as fairLocationName,
            fl.city as city,
            fl.state as state,
            coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement cm
        join fair_location fl on fl.id = cm.fair_location_id
        where cm.fair_location_id is not null
        group by cm.fair_location_id, fl.name, fl.city, fl.state
        order by coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0)
                 - coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) desc,
                 fl.name asc
        """, nativeQuery = true)
    List<LocationPerformanceProjection> summarizeByLocation();

    @Query(value = """
        select
            cm.fair_location_id as fairLocationId,
            fl.name as fairLocationName,
            fl.city as city,
            fl.state as state,
            coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement cm
        join fair_location fl on fl.id = cm.fair_location_id
        where cm.fair_location_id is not null
          and cm.occurred_on >= :startDate
        group by cm.fair_location_id, fl.name, fl.city, fl.state
        order by coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0)
                 - coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) desc,
                 fl.name asc
        """, nativeQuery = true)
    List<LocationPerformanceProjection> summarizeByLocationOccurredOnGreaterThanEqual(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate
    );

    @Query(value = """
        select
            cm.fair_location_id as fairLocationId,
            fl.name as fairLocationName,
            fl.city as city,
            fl.state as state,
            coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement cm
        join fair_location fl on fl.id = cm.fair_location_id
        where cm.fair_location_id is not null
          and cm.occurred_on <= :endDate
        group by cm.fair_location_id, fl.name, fl.city, fl.state
        order by coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0)
                 - coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) desc,
                 fl.name asc
        """, nativeQuery = true)
    List<LocationPerformanceProjection> summarizeByLocationOccurredOnLessThanEqual(
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    @Query(value = """
        select
            cm.fair_location_id as fairLocationId,
            fl.name as fairLocationName,
            fl.city as city,
            fl.state as state,
            coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0) as totalIncome,
            coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) as totalExpense,
            count(*) as movementCount
        from cash_movement cm
        join fair_location fl on fl.id = cm.fair_location_id
        where cm.fair_location_id is not null
          and cm.occurred_on between :startDate and :endDate
        group by cm.fair_location_id, fl.name, fl.city, fl.state
        order by coalesce(sum(case when cm.type = 'INCOME' then cm.amount else 0 end), 0)
                 - coalesce(sum(case when cm.type = 'EXPENSE' then cm.amount else 0 end), 0) desc,
                 fl.name asc
        """, nativeQuery = true)
    List<LocationPerformanceProjection> summarizeByLocationOccurredOnBetween(
        @org.springframework.data.repository.query.Param("startDate") LocalDate startDate,
        @org.springframework.data.repository.query.Param("endDate") LocalDate endDate
    );

    interface DashboardSummaryProjection {
        BigDecimal getTotalIncome();

        BigDecimal getTotalExpense();
    }

    interface CashClosureProjection {
        BigDecimal getTotalIncome();

        BigDecimal getTotalExpense();

        Long getMovementCount();
    }

    interface DayPerformanceProjection {
        Integer getDayOfWeek();

        BigDecimal getTotalIncome();

        BigDecimal getTotalExpense();

        Long getMovementCount();
    }

    interface LocationPerformanceProjection {
        UUID getFairLocationId();

        String getFairLocationName();

        String getCity();

        String getState();

        BigDecimal getTotalIncome();

        BigDecimal getTotalExpense();

        Long getMovementCount();
    }
}
