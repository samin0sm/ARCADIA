package com.gamingevents.repository;
import com.gamingevents.entity.*;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface RankingRepository extends JpaRepository<Ranking,Long>{List<Ranking> findAllByOrderByPointsDescWinsDesc(); Optional<Ranking> findByPlayer(PlayerProfile player);}
