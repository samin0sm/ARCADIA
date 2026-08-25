package com.gamingevents.controller;

import com.gamingevents.dto.TournamentDtos.MyTournamentResponse;
import com.gamingevents.repository.RegistrationRepository;
import com.gamingevents.service.TournamentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@Tag(name = "Player Tournaments", description = "Endpoints for player registrations and tournament history")
public class RegistrationController {

    private final TournamentService tournamentService;
    private final RegistrationRepository registrations;

    public RegistrationController(TournamentService tournamentService, RegistrationRepository registrations) {
        this.tournamentService = tournamentService;
        this.registrations = registrations;
    }

    @GetMapping("/players/tournaments")
    @PreAuthorize("hasRole('PLAYER')")
    @Operation(summary = "My registered tournaments", description = "List all tournaments joined by the authenticated player")
    public List<MyTournamentResponse> mine(Authentication a) {
        return tournamentService.myTournaments(a.getName());
    }

    @GetMapping("/tournaments/{id}/players")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "List players registered for tournament")
    public List<Map<String, Object>> players(@PathVariable Long id) {
        return registrations.findAll().stream()
                .filter(r -> r.getTournament().getId().equals(id))
                .map(r -> Map.<String, Object>of("id", r.getPlayer().getId(), "username", r.getPlayer().getUsername()))
                .toList();
    }
}
