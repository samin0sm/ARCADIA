package com.gamingevents.repository;

import com.gamingevents.entity.PlayerProfile;
import com.gamingevents.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile, Long> {
    Optional<PlayerProfile> findByUserId(Long id);
    Optional<PlayerProfile> findByUser(User user);
    Optional<PlayerProfile> findByUsername(String username);
}
