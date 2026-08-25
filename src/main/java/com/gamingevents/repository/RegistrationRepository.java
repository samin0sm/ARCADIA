package com.gamingevents.repository;

import com.gamingevents.entity.PlayerProfile;
import com.gamingevents.entity.Registration;
import com.gamingevents.entity.RegistrationStatus;
import com.gamingevents.entity.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Long> {
    boolean existsByPlayerAndTournament(PlayerProfile p, Tournament t);

    long countByTournament(Tournament t);

    long countByTournamentAndStatus(Tournament t, RegistrationStatus status);

    List<Registration> findByPlayer(PlayerProfile p);

    List<Registration> findByTournament(Tournament t);

    List<Registration> findByTournamentAndStatus(Tournament t, RegistrationStatus status);
}
