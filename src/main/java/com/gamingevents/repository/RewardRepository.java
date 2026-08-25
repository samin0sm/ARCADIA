package com.gamingevents.repository;

import com.gamingevents.entity.PlayerProfile;
import com.gamingevents.entity.Reward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByPlayerOrderByCreatedAtDesc(PlayerProfile player);

    List<Reward> findByPlayerIdOrderByCreatedAtDesc(Long playerId);
}
