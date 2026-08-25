package com.gamingevents.repository;

import com.gamingevents.entity.GameMatch;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GameMatchRepository extends JpaRepository<GameMatch, Long> {
    List<GameMatch> findByTournamentId(Long id);

    List<GameMatch> findByTournamentIdOrderByRoundNumberAscIdAsc(Long id);

    List<GameMatch> findByTournamentIdAndRoundNumber(Long tournamentId, int roundNumber);

    boolean existsByTournamentId(Long tournamentId);

    long countByTournamentIdAndStatus(Long tournamentId, com.gamingevents.entity.MatchStatus status);

    List<GameMatch> findByPlayerOneOrPlayerTwoOrderByIdDesc(com.gamingevents.entity.PlayerProfile p1, com.gamingevents.entity.PlayerProfile p2);
}
