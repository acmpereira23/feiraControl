package com.feiracontrol.backend.controller.fair;

import com.feiracontrol.backend.application.fair.CreateFairLocationService;
import com.feiracontrol.backend.application.fair.ListFairLocationsService;
import com.feiracontrol.backend.application.fair.command.CreateFairLocationCommand;
import com.feiracontrol.backend.application.fair.result.FairLocationView;
import com.feiracontrol.backend.application.fairclosure.GetFairLocationCashClosureService;
import com.feiracontrol.backend.application.fairclosure.query.GetFairLocationCashClosureQuery;
import com.feiracontrol.backend.controller.fair.dto.CreateFairLocationRequest;
import com.feiracontrol.backend.controller.fair.dto.FairLocationCashClosureResponse;
import com.feiracontrol.backend.controller.fair.dto.FairLocationResponse;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/fair-locations")
public class FairLocationController {

    private final CreateFairLocationService createFairLocationService;
    private final ListFairLocationsService listFairLocationsService;
    private final GetFairLocationCashClosureService getFairLocationCashClosureService;

    public FairLocationController(
        CreateFairLocationService createFairLocationService,
        ListFairLocationsService listFairLocationsService,
        GetFairLocationCashClosureService getFairLocationCashClosureService
    ) {
        this.createFairLocationService = createFairLocationService;
        this.listFairLocationsService = listFairLocationsService;
        this.getFairLocationCashClosureService = getFairLocationCashClosureService;
    }

    @PostMapping
    public FairLocationResponse create(@Valid @RequestBody CreateFairLocationRequest request) {
        return toResponse(createFairLocationService.create(new CreateFairLocationCommand(
            request.name(),
            request.city(),
            request.state(),
            request.reference(),
            request.operatingDays()
        )));
    }

    @GetMapping
    public List<FairLocationResponse> list() {
        return listFairLocationsService.list().stream()
            .map(this::toResponse)
            .toList();
    }

    @GetMapping("/{fairLocationId}/cash-closure")
    public FairLocationCashClosureResponse getCashClosure(
        @PathVariable UUID fairLocationId,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        var closure = getFairLocationCashClosureService.get(new GetFairLocationCashClosureQuery(
            fairLocationId,
            startDate,
            endDate
        ));

        return new FairLocationCashClosureResponse(
            closure.fairLocationId(),
            closure.fairLocationName(),
            closure.city(),
            closure.state(),
            closure.startDate(),
            closure.endDate(),
            closure.totalIncome(),
            closure.totalExpense(),
            closure.profit(),
            closure.movementCount()
        );
    }

    private FairLocationResponse toResponse(FairLocationView fairLocation) {
        return new FairLocationResponse(
            fairLocation.id(),
            fairLocation.name(),
            fairLocation.city(),
            fairLocation.state(),
            fairLocation.reference(),
            fairLocation.operatingDays(),
            fairLocation.createdAt(),
            fairLocation.updatedAt()
        );
    }
}
