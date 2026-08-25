package com.gamingevents.controller;

import com.gamingevents.entity.Tournament;
import com.gamingevents.entity.TournamentStatus;
import com.gamingevents.repository.TournamentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/tournaments")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Tournaments", description = "Tournament moderation and approval APIs for platform administrators")
public class AdminTournamentController {

    private final TournamentRepository tournaments;

    public AdminTournamentController(TournamentRepository tournaments) {
        this.tournaments = tournaments;
    }

    @GetMapping
    @Operation(summary = "List all tournaments for moderation")
    public List<Map<String, Object>> list() {
        return tournaments.findAll().stream()
                .map(t -> Map.<String, Object>of(
                        "id", t.getId(),
                        "name", t.getName(),
                        "game", t.getGameName(),
                        "status", t.getStatus().name(),
                        "organizer", t.getOrganizer().getName()
                ))
                .toList();
    }

    @PutMapping("/{id}/approve")
    @Operation(summary = "Approve pending tournament")
    public void approve(@PathVariable Long id) {
        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));
        t.setStatus(TournamentStatus.UPCOMING);
        tournaments.save(t);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tournament by admin")
    public void delete(@PathVariable Long id) {
        if (!tournaments.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id);
        }
        tournaments.deleteById(id);
    }
}
