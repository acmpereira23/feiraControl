package com.feiracontrol.backend.infrastructure.persistence.jpa.fair;

import static org.assertj.core.api.Assertions.assertThat;

import com.feiracontrol.backend.application.fair.NewFairLocation;
import com.feiracontrol.backend.domain.fair.FairLocation;
import java.time.DayOfWeek;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("e2e")
class JpaFairLocationStoreIntegrationTest {

    @Autowired
    private JpaFairLocationStore jpaFairLocationStore;

    @Autowired
    private com.feiracontrol.backend.infrastructure.persistence.jpa.repository.FairLocationJpaRepository fairLocationJpaRepository;

    @BeforeEach
    void setUp() {
        fairLocationJpaRepository.deleteAll();
    }

    @Test
    void shouldListFairLocationsWithOperatingDaysLoaded() {
        jpaFairLocationStore.create(new NewFairLocation(
            "Feira Central",
            "Campinas",
            "SP",
            "Perto da igreja",
            Set.of(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY)
        ));

        List<FairLocation> result = jpaFairLocationStore.list();

        assertThat(result).hasSize(1);
        assertThat(result.getFirst().name()).isEqualTo("Feira Central");
        assertThat(result.getFirst().operatingDays()).containsExactly(DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY);
    }
}
