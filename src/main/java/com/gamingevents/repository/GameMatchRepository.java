package com.gamingevents.repository;
import com.gamingevents.entity.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface GameMatchRepository extends JpaRepository<GameMatch,Long>{List<GameMatch> findByTournamentId(Long id);}
