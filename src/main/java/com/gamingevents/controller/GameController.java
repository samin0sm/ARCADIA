package com.gamingevents.controller;

import com.gamingevents.dto.GameDtos.*;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api")
public class GameController {

 private final UserRepository users;
 private final PlayerProfileRepository profiles;
 private final TournamentRepository tournaments;
 private final GameMatchRepository matches;
 private final RankingRepository rankings;

 public GameController(UserRepository u,
                       PlayerProfileRepository p,
                       TournamentRepository t,
                       GameMatchRepository m,
                       RankingRepository r) {
  users = u;
  profiles = p;
  tournaments = t;
  matches = m;
  rankings = r;
 }

 private PlayerProfile profile(Authentication a) {
  return profiles.findByUserId(
                  users.findByEmail(a.getName()).orElseThrow().getId())
          .orElseThrow(() ->
                  new IllegalArgumentException("Player profile required"));
 }

 private ProfileResponse map(PlayerProfile p) {
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

 @GetMapping("/players/profile")
 @PreAuthorize("hasRole('PLAYER')")
 public ProfileResponse getProfile(Authentication a) {
  return map(profile(a));
 }

 @PutMapping("/players/profile")
 @PreAuthorize("hasRole('PLAYER')")
 public ProfileResponse updateProfile(Authentication a,
                                      @Valid @RequestBody ProfileRequest r) {
  var p = profile(a);
  p.setUsername(r.username());
  p.setProfileImage(r.profileImage());
  p.setFavoriteGame(r.favoriteGame());
  p.setSkillLevel(r.skillLevel());
  return map(profiles.save(p));
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
  var m = new GameMatch();
  m.setTournament(tournaments.findById(r.tournamentId()).orElseThrow());
  m.setPlayerOne(profiles.findById(r.playerOneId()).orElseThrow());
  m.setPlayerTwo(profiles.findById(r.playerTwoId()).orElseThrow());
  m.setRoundName(r.roundName());
  return map(matches.save(m));
 }

 @GetMapping("/matches/{tournamentId}")
 public List<MatchResponse> list(@PathVariable Long tournamentId) {
  return matches.findByTournamentId(tournamentId)
          .stream()
          .map(this::map)
          .toList();
 }

 @PutMapping("/matches/{id}/result")
 @PreAuthorize("hasAnyRole('ORGANIZER','ADMIN')")
 public MatchResponse result(@PathVariable Long id,
                             @Valid @RequestBody ResultRequest r) {

  var m = matches.findById(id).orElseThrow();

  if (m.getStatus() == MatchStatus.COMPLETED)
   throw new IllegalArgumentException("Result already submitted");

  var winner = profiles.findById(r.winnerId()).orElseThrow();

  if (!winner.getId().equals(m.getPlayerOne().getId())
          && !winner.getId().equals(m.getPlayerTwo().getId()))
   throw new IllegalArgumentException("Winner must be a match participant");

  m.complete(winner);

  var loser = winner.getId().equals(m.getPlayerOne().getId())
          ? m.getPlayerTwo()
          : m.getPlayerOne();

  winner.won();
  loser.lost();

  profiles.save(winner);
  profiles.save(loser);

  sync(winner);
  sync(loser);

  return map(matches.save(m));
 }

 private void sync(PlayerProfile p) {
  var r = rankings.findByPlayer(p).orElseGet(() -> {
   var x = new Ranking();
   x.setPlayer(p);
   return x;
  });
  r.sync();
  rankings.save(r);
 }

 private MatchResponse map(GameMatch m) {
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
}