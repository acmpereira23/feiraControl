package com.feiracontrol.backend.application.fair;

import com.feiracontrol.backend.application.auth.AuthContextService;
import com.feiracontrol.backend.application.auth.exception.UnauthenticatedAccessException;
import com.feiracontrol.backend.application.fair.result.FairLocationView;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ListFairLocationsService {

    private final AuthContextService authContextService;
    private final FairLocationStore fairLocationStore;

    public ListFairLocationsService(AuthContextService authContextService, FairLocationStore fairLocationStore) {
        this.authContextService = authContextService;
        this.fairLocationStore = fairLocationStore;
    }

    public List<FairLocationView> list() {
        authContextService.currentUser().orElseThrow(UnauthenticatedAccessException::new);

        return fairLocationStore.list().stream()
            .map(fairLocation -> new FairLocationView(
                fairLocation.id(),
                fairLocation.name(),
                fairLocation.city(),
                fairLocation.state(),
                fairLocation.reference(),
                fairLocation.operatingDays(),
                fairLocation.createdAt(),
                fairLocation.updatedAt()
            ))
            .toList();
    }
}
