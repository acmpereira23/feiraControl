package com.feiracontrol.backend.infrastructure.persistence.jpa.cash;

import com.feiracontrol.backend.application.cash.CashMovementStore;
import com.feiracontrol.backend.application.cash.NewCashMovement;
import com.feiracontrol.backend.domain.cash.CashMovement;
import com.feiracontrol.backend.infrastructure.persistence.jpa.entity.CashMovementJpaEntity;
import com.feiracontrol.backend.infrastructure.persistence.jpa.repository.CashMovementJpaRepository;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
public class JpaCashMovementStore implements CashMovementStore {

    private final CashMovementJpaRepository cashMovementJpaRepository;

    public JpaCashMovementStore(CashMovementJpaRepository cashMovementJpaRepository) {
        this.cashMovementJpaRepository = cashMovementJpaRepository;
    }

    @Override
    public CashMovement create(NewCashMovement newCashMovement) {
        Instant now = Instant.now();

        CashMovementJpaEntity entity = new CashMovementJpaEntity();
        entity.setId(UUID.randomUUID());
        entity.setFairLocationId(newCashMovement.fairLocationId());
        entity.setType(newCashMovement.type());
        entity.setDescription(newCashMovement.description());
        entity.setAmount(newCashMovement.amount());
        entity.setOccurredOn(newCashMovement.occurredOn());
        entity.setCreatedAt(now);
        entity.setUpdatedAt(now);

        return toDomain(cashMovementJpaRepository.save(entity));
    }

    @Override
    public List<CashMovement> list(Optional<LocalDate> startDate, Optional<LocalDate> endDate) {
        List<CashMovementJpaEntity> entities = switch (resolveRangeMode(startDate, endDate)) {
            case ALL -> cashMovementJpaRepository.findAllByOrderByOccurredOnDescCreatedAtDesc();
            case START_ONLY -> cashMovementJpaRepository.findAllByOccurredOnGreaterThanEqualOrderByOccurredOnDescCreatedAtDesc(
                startDate.orElseThrow()
            );
            case END_ONLY -> cashMovementJpaRepository.findAllByOccurredOnLessThanEqualOrderByOccurredOnDescCreatedAtDesc(
                endDate.orElseThrow()
            );
            case BETWEEN -> cashMovementJpaRepository.findAllByOccurredOnBetweenOrderByOccurredOnDescCreatedAtDesc(
                startDate.orElseThrow(),
                endDate.orElseThrow()
            );
        };

        return entities.stream()
            .map(this::toDomain)
            .toList();
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

    private CashMovement toDomain(CashMovementJpaEntity entity) {
        return new CashMovement(
            entity.getId(),
            entity.getFairLocationId(),
            entity.getType(),
            entity.getDescription(),
            entity.getAmount(),
            entity.getOccurredOn(),
            entity.getCreatedAt(),
            entity.getUpdatedAt()
        );
    }

    private enum RangeMode {
        ALL,
        START_ONLY,
        END_ONLY,
        BETWEEN
    }
}
