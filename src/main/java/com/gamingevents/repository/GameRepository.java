package com.gamingevents.repository;

import com.gamingevents.entity.Game;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GameRepository extends JpaRepository<Game, Long> {
    List<Game> findAllByStatusOrderByNameAsc(String status);
    Optional<Game> findByNameIgnoreCase(String name);
}
