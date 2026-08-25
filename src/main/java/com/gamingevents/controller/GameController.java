package com.gamingevents.controller;

import com.gamingevents.dto.GameDtos.*;
import com.gamingevents.dto.RewardDtos.BalanceResponse;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import com.gamingevents.service.MatchService;
import com.gamingevents.service.RewardService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@RestController
@RequestMapping("/api")
public class GameController {

    private final UserRepository users;
    private final PlayerProfileRepository profiles;
    private final TournamentRepository tournaments;
    private final GameMatchRepository matches;
    private final RankingRepository rankings;
    private final MatchService matchService;
    private final RewardService rewardService;

    public GameController(UserRepository u,
                          PlayerProfileRepository p,
                          TournamentRepository t,
                          GameMatchRepository m,
                          RankingRepository r,
                          MatchService matchService,
                          RewardService rewardService) {
        this.users = u;
        this.profiles = p;
        this.tournaments = t;
        this.matches = m;
        this.rankings = r;
        this.matchService = matchService;
        this.rewardService = rewardService;
    }

    private PlayerProfile profile(Authentication a) {
        if (a == null || a.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
        }
        var user = users.findByEmail(a.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is disabled");
        }
        return profiles.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Player profile required"));
    }

    private ProfileResponse mapProfile(PlayerProfile p) {
        return new ProfileResponse(
                p.getId(),
                p.getUsername(),
                p.getProfileImage(),
                p.getFavoriteGame(),
                p.getSkillLevel(),
                p.getTotalMatches(),
                p.getWins(),
                p.getLosses(),
                p.getRankingPoints(),
                p.getTokenBalance()
        );
    }

    private MatchResponse mapMatch(GameMatch m) {
        return new MatchResponse(
                m.getId(),
                m.getTournament().getId(),
                m.getPlayerOne().getId(),
                m.getPlayerOne().getUsername(),
                m.getPlayerTwo().getId(),
                m.getPlayerTwo().getUsername(),
                m.getWinner() == null ? null : m.getWinner().getId(),
                m.getWinner() == null ? null : m.getWinner().getUsername(),
                m.getRoundName(),
                m.getRoundNumber(),
                m.getStatus().name(),
                m.getPlayerOneScore(),
                m.getPlayerTwoScore()
        );
    }

    @GetMapping("/players/profile")
    @PreAuthorize("hasRole('PLAYER')")
    public ProfileResponse getProfile(Authentication a) {
        return mapProfile(profile(a));
    }

    @PutMapping("/players/profile")
    @PreAuthorize("hasRole('PLAYER')")
    public ProfileResponse updateProfile(Authentication a,
                                         @Valid @RequestBody ProfileRequest r) {
        var p = profile(a);
        String newUsername = r.username().trim();
        if (!newUsername.equalsIgnoreCase(p.getUsername())) {
            profiles.findByUsername(newUsername).ifPresent(existing -> {
                if (!existing.getId().equals(p.getId())) {
                    throw new org.springframework.web.server.ResponseStatusException(org.springframework.http.HttpStatus.CONFLICT, "Gamer tag already taken");
                }
            });
        }
        p.setUsername(newUsername);
        p.setProfileImage(r.profileImage());
        p.setFavoriteGame(r.favoriteGame());
        p.setSkillLevel(r.skillLevel());
        return mapProfile(profiles.save(p));
    }

    @GetMapping("/players/matches")
    @PreAuthorize("hasRole('PLAYER')")
    public List<MatchResponse> playerMatches(Authentication a) {
        var p = profile(a);
        return matches.findByPlayerOneOrPlayerTwoOrderByIdDesc(p, p).stream()
                .map(this::mapMatch)
                .toList();
    }

    @GetMapping("/rewards/history")
    @PreAuthorize("hasRole('PLAYER')")
    public BalanceResponse rewardsHistory(Authentication a) {
        return rewardService.getHistory(a.getName());
    }

    @GetMapping("/rewards/balance")
    @PreAuthorize("hasRole('PLAYER')")
    public Map<String, Object> rewardsBalance(Authentication a) {
        return Map.of("balance", rewardService.getBalance(a.getName()));
    }

    @GetMapping("/rankings")
    public List<RankingResponse> leaderboard() {
        var all = rankings.findAllByOrderByPointsDescWinsDesc();
        var out = new ArrayList<RankingResponse>();

        for (int i = 0; i < all.size(); i++) {
            var r = all.get(i);
            out.add(new RankingResponse(
                    i + 1,
                    r.getPlayer().getUsername(),
                    r.getPoints(),
                    r.getPlayer().getWins(),
                    r.getPlayer().getLosses()));
        }

        return out;
    }

    @PostMapping("/matches")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public MatchResponse create(@Valid @RequestBody MatchRequest r) {
        return matchService.createManual(r);
    }

    @GetMapping("/matches/{tournamentId}")
    public List<MatchResponse> list(@PathVariable Long tournamentId) {
        return matchService.listPublic(tournamentId);
    }

    @PutMapping("/matches/{id}/result")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public MatchResponse result(@PathVariable Long id,
                                @Valid @RequestBody ResultRequest r,
                                Authentication a) {
        return matchService.submitResult(id, r, a.getName());
    }

    @PutMapping("/matches/{id}/status")
    @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
    public MatchResponse updateStatus(@PathVariable Long id,
                                      @Valid @RequestBody StatusRequest r,
                                      Authentication a) {
        return matchService.updateStatus(id, r.status(), a.getName());
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<Map<String, Object>> users() {
        return users.findAll().stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "name", u.getName(),
                        "email", u.getEmail(),
                        "role", u.getRole().name(),
                        "enabled", u.isEnabled()))
                .toList();
    }

    @PutMapping("/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public void status(@PathVariable Long id,
                       @RequestBody UserStatusRequest r) {
        var u = users.findById(id).orElseThrow();
        u.setEnabled(r.enabled());
        users.save(u);
    }

    @GetMapping("/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> adminStats() {
        var allUsers = users.findAll();
        var allTournaments = tournaments.findAll();
        long pendingTournaments = allTournaments.stream().filter(t -> t.getStatus() == TournamentStatus.PENDING).count();
        long activeTournaments = allTournaments.stream().filter(t -> t.getStatus() == TournamentStatus.ONGOING || t.getStatus() == TournamentStatus.UPCOMING).count();
        long completedTournaments = allTournaments.stream().filter(t -> t.getStatus() == TournamentStatus.COMPLETED).count();

        long players = allUsers.stream().filter(u -> u.getRole() == Role.PLAYER).count();
        long organizers = allUsers.stream().filter(u -> u.getRole() == Role.ORGANIZER).count();
        long admins = allUsers.stream().filter(u -> u.getRole() == Role.ADMIN).count();

        return Map.of(
                "totalUsers", allUsers.size(),
                "totalTournaments", allTournaments.size(),
                "pendingTournaments", pendingTournaments,
                "activeTournaments", activeTournaments,
                "completedTournaments", completedTournaments,
                "playerCount", players,
                "organizerCount", organizers,
                "adminCount", admins,
                "totalMatches", matches.count()
        );
    }
}