package com.gamingevents.repository;
import com.gamingevents.entity.PlayerProfile;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface PlayerProfileRepository extends JpaRepository<PlayerProfile,Long>{Optional<PlayerProfile> findByUserId(Long id);}
