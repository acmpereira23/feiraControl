package com.feiracontrol.backend.application.fair;

import com.feiracontrol.backend.domain.fair.FairLocation;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FairLocationStore {

    FairLocation create(NewFairLocation newFairLocation);

    Optional<FairLocation> findById(UUID id);

    List<FairLocation> list();
}
