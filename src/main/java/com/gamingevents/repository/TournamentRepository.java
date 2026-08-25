package com.gamingevents.repository;

import com.gamingevents.entity.Tournament;
import com.gamingevents.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TournamentRepository extends JpaRepository<Tournament, Long> {
    List<Tournament> findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase(String name, String game);

    List<Tournament> findByOrganizer(User organizer);

    List<Tournament> findByStatus(com.gamingevents.entity.TournamentStatus status);

    List<Tournament> findByNameContainingIgnoreCaseAndStatus(String name, com.gamingevents.entity.TournamentStatus status);
}
