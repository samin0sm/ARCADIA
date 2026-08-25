package com.gamingevents.controller;

import com.gamingevents.dto.GameDtos.BracketResponse;
import com.gamingevents.dto.GameDtos.MatchResponse;
import com.gamingevents.dto.GameDtos.PairingResponse;
import com.gamingevents.dto.TournamentDtos.*;
import com.gamingevents.service.MatchService;
import com.gamingevents.service.TournamentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tournaments")
@Tag(name = "Tournaments", description = "Tournament discovery, registration, and management APIs")
public class TournamentController {

    private final TournamentService tournamentService;
    private final MatchService matchService;

    public TournamentController(TournamentService tournamentService, MatchService matchService) {
        this.tournamentService = tournamentService;
        this.matchService = matchService;
    }

    @GetMapping
    @Operation(summary = "Discover tournaments", description = "List available tournaments with optional search query and game filter")
    public List<Response> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String game) {
        return tournamentService.list(search, game);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get tournament details", description = "View full tournament details, capacity, start date, and rules")
    public Response get(@PathVariable Long id) {
        return tournamentService.get(id);
    }

    @PostMapping("/{id}/join")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('PLAYER')")
    @Operation(summary = "Join tournament", description = "Register the authenticated player for an upcoming tournament")
    public JoinResponse join(@PathVariable Long id, Authentication a) {
        return tournamentService.join(id, a.getName());
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('PLAYER')")
    @Operation(summary = "My registered tournaments", description = "List all tournaments joined by the authenticated player")
    public List<MyTournamentResponse> myTournaments(Authentication a) {
        return tournamentService.myTournaments(a.getName());
    }

    @GetMapping("/organizer")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Organizer tournaments", description = "List tournaments hosted by the authenticated organizer")
    public List<OrganizerResponse> listForOrganizer(Authentication a) {
        return tournamentService.listForOrganizer(a.getName());
    }

    @GetMapping("/dashboard-stats")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Organizer dashboard statistics")
    public DashboardStatsResponse getDashboardStats(Authentication a) {
        return tournamentService.getDashboardStats(a.getName());
    }

    @GetMapping("/{id}/stats")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Tournament statistics")
    public StatsResponse getStats(@PathVariable Long id, Authentication a) {
        return tournamentService.getStats(id, a.getName());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Create tournament")
    public Response create(@Valid @RequestBody Request r, Authentication a) {
        return tournamentService.create(r, a.getName());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Update tournament")
    public Response update(@PathVariable Long id, @Valid @RequestBody Request r, Authentication a) {
        return tournamentService.update(id, r, a.getName());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Delete tournament")
    public void delete(@PathVariable Long id, Authentication a) {
        tournamentService.delete(id, a.getName());
    }

    @GetMapping("/{id}/roster")
    @Operation(summary = "Public tournament roster", description = "List approved participants in the tournament")
    public List<RegistrationResponse> getPublicRoster(@PathVariable Long id) {
        return tournamentService.getPublicRoster(id);
    }

    @GetMapping("/{id}/registrations")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Manage tournament registrations")
    public List<RegistrationResponse> getRegistrations(@PathVariable Long id, Authentication a) {
        return tournamentService.getRegistrations(id, a.getName());
    }

    @PutMapping("/registrations/{registrationId}/approve")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Approve tournament registration")
    public RegistrationResponse approveRegistration(@PathVariable Long registrationId, Authentication a) {
        return tournamentService.approveRegistration(registrationId, a.getName());
    }

    @PostMapping("/{id}/pairings")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    @Operation(summary = "Generate tournament bracket pairings")
    public PairingResponse generatePairings(@PathVariable Long id, Authentication a) {
        return matchService.generatePairings(id, a.getName());
    }

    @GetMapping("/{id}/bracket")
    @Operation(summary = "Get tournament bracket tree")
    public BracketResponse getBracket(@PathVariable Long id) {
        return matchService.getBracket(id);
    }

    @GetMapping("/{id}/matches")
    @Operation(summary = "List matches for tournament")
    public List<MatchResponse> getMatches(@PathVariable Long id) {
        return matchService.listPublic(id);
    }
}
