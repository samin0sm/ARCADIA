package com.gamingevents.repository;
import com.gamingevents.entity.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RegistrationRepository extends JpaRepository<Registration,Long>{boolean existsByPlayerAndTournament(PlayerProfile p,Tournament t); long countByTournament(Tournament t); List<Registration> findByPlayer(PlayerProfile p); List<Registration> findByTournament(Tournament t);}
