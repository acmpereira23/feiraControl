package com.feiracontrol.backend.application.fair;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.fair.command.CreateFairLocationCommand;
import com.feiracontrol.backend.application.fair.result.FairLocationView;
import com.feiracontrol.backend.domain.fair.FairLocation;
import java.util.Set;
import java.util.TreeSet;
import org.springframework.stereotype.Service;

@Service
public class CreateFairLocationService {

    private final AuthContextService authContextService;
    private final FairLocationStore fairLocationStore;

    public CreateFairLocationService(AuthContextService authContextService, FairLocationStore fairLocationStore) {
        this.authContextService = authContextService;
        this.fairLocationStore = fairLocationStore;
    }

    public FairLocationView create(CreateFairLocationCommand command) {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        FairLocation fairLocation = fairLocationStore.create(new NewFairLocation(
            command.name().trim(),
            command.city().trim(),
            command.state().trim(),
            trimToNull(command.reference()),
            normalizeOperatingDays(command.operatingDays())
        ));

        return toView(fairLocation);
    }

    private Set<java.time.DayOfWeek> normalizeOperatingDays(Set<java.time.DayOfWeek> operatingDays) {
        return new TreeSet<>(operatingDays);
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private FairLocationView toView(FairLocation fairLocation) {
        return new FairLocationView(
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
