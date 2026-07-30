package com.gamingevents.repository;
import com.gamingevents.entity.Tournament;
import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;
public interface TournamentRepository extends JpaRepository<Tournament,Long>{List<Tournament> findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase(String name,String game);}
