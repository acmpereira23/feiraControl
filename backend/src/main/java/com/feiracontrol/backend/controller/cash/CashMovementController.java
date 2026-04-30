package com.feiracontrol.backend.controller.cash;

import com.feiracontrol.backend.application.cash.CreateCashMovementService;
import com.feiracontrol.backend.application.cash.ListCashMovementsService;
import com.feiracontrol.backend.application.cash.command.CreateCashMovementCommand;
import com.feiracontrol.backend.application.cash.query.ListCashMovementsQuery;
import com.feiracontrol.backend.application.cash.result.CashMovementView;
import com.feiracontrol.backend.controller.cash.dto.CashMovementResponse;
import com.feiracontrol.backend.controller.cash.dto.CreateCashMovementRequest;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cash-movements")
public class CashMovementController {

    private final CreateCashMovementService createCashMovementService;
    private final ListCashMovementsService listCashMovementsService;

    public CashMovementController(
        CreateCashMovementService createCashMovementService,
        ListCashMovementsService listCashMovementsService
    ) {
        this.createCashMovementService = createCashMovementService;
        this.listCashMovementsService = listCashMovementsService;
    }

    @PostMapping
    public CashMovementResponse create(@Valid @RequestBody CreateCashMovementRequest request) {
        return toResponse(createCashMovementService.create(new CreateCashMovementCommand(
            request.fairLocationId(),
            request.type(),
            request.description(),
            request.amount(),
            request.occurredOn()
        )));
    }

    @GetMapping
    public List<CashMovementResponse> list(
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return listCashMovementsService.list(new ListCashMovementsQuery(startDate, endDate)).stream()
            .map(this::toResponse)
            .toList();
    }

    private CashMovementResponse toResponse(CashMovementView movement) {
        return new CashMovementResponse(
            movement.id(),
            movement.fairLocationId(),
            movement.type(),
            movement.description(),
            movement.amount(),
            movement.occurredOn(),
            movement.createdAt(),
            movement.updatedAt()
        );
    }
}
