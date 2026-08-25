package com.gamingevents.service;

import com.gamingevents.dto.GameDtos.*;
import com.gamingevents.dto.RewardDtos.RewardResponse;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchService {
    private final GameMatchRepository matches;
    private final TournamentRepository tournaments;
    private final RegistrationRepository registrations;
    private final PlayerProfileRepository profiles;
    private final RankingRepository rankings;
    private final UserRepository users;
    private final RewardService rewardService;

    public MatchService(
            GameMatchRepository matches,
            TournamentRepository tournaments,
            RegistrationRepository registrations,
            PlayerProfileRepository profiles,
            RankingRepository rankings,
            UserRepository users,
            RewardService rewardService) {
        this.matches = matches;
        this.tournaments = tournaments;
        this.registrations = registrations;
        this.profiles = profiles;
        this.rankings = rankings;
        this.users = users;
        this.rewardService = rewardService;
    }

    @Transactional
    public PairingResponse generatePairings(Long tournamentId, String organizerEmail) {
        Tournament tournament = tournaments.findById(tournamentId).orElseThrow();
        verifyOrganizer(tournament, organizerEmail);

        if (matches.existsByTournamentId(tournamentId)) {
            throw new IllegalArgumentException("Pairings already generated for this tournament");
        }

        List<PlayerProfile> participants = registrations.findByTournamentAndStatus(tournament, RegistrationStatus.APPROVED)
                .stream()
                .map(Registration::getPlayer)
                .collect(Collectors.toList());

        if (participants.size() < 2) {
            throw new IllegalArgumentException("At least 2 approved participants required to generate pairings");
        }

        Collections.shuffle(participants);

        List<GameMatch> created = new ArrayList<>();
        int roundNumber = 1;
        String roundName = "Round " + roundNumber;

        for (int i = 0; i < participants.size(); i += 2) {
            if (i + 1 >= participants.size()) {
                break;
            }
            GameMatch match = new GameMatch();
            match.setTournament(tournament);
            match.setPlayerOne(participants.get(i));
            match.setPlayerTwo(participants.get(i + 1));
            match.setRoundName(roundName);
            match.setRoundNumber(roundNumber);
            match.setStatus(MatchStatus.SCHEDULED);
            created.add(matches.save(match));
        }

        if (tournament.getStatus() == TournamentStatus.UPCOMING) {
            tournament.setStatus(TournamentStatus.ONGOING);
            tournaments.save(tournament);
        }

        return new PairingResponse(
                created.size(),
                created.stream().map(this::map).toList());
    }

    public List<MatchResponse> listByTournament(Long tournamentId, String organizerEmail) {
        Tournament tournament = tournaments.findById(tournamentId).orElseThrow();
        verifyOrganizerOrAdmin(tournament, organizerEmail);
        return matches.findByTournamentIdOrderByRoundNumberAscIdAsc(tournamentId).stream()
                .map(this::map)
                .toList();
    }

    public MatchResponse get(Long id) {
        return map(matches.findById(id).orElseThrow());
    }

    public BracketResponse getBracket(Long tournamentId) {
        Tournament tournament = tournaments.findById(tournamentId).orElseThrow();
        List<GameMatch> all = matches.findByTournamentIdOrderByRoundNumberAscIdAsc(tournamentId);

        Map<Integer, List<GameMatch>> byRound = all.stream()
                .collect(Collectors.groupingBy(GameMatch::getRoundNumber, TreeMap::new, Collectors.toList()));

        List<RoundResponse> rounds = byRound.entrySet().stream()
                .map(e -> new RoundResponse(
                        e.getKey(),
                        e.getValue().get(0).getRoundName(),
                        e.getValue().stream().map(this::map).toList()))
                .toList();

        String champion = tournament.getChampion() != null ? tournament.getChampion().getUsername() : null;
        return new BracketResponse(tournament.getId(), tournament.getName(), champion, rounds);
    }

    @Transactional
    public MatchResponse submitResult(Long id, ResultRequest request, String email) {
        GameMatch match = matches.findById(id).orElseThrow();
        verifyOrganizerOrAdmin(match.getTournament(), email);

        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new IllegalArgumentException("Result already submitted");
        }

        PlayerProfile winner = profiles.findById(request.winnerId()).orElseThrow();
        if (!winner.getId().equals(match.getPlayerOne().getId())
                && !winner.getId().equals(match.getPlayerTwo().getId())) {
            throw new IllegalArgumentException("Winner must be a match participant");
        }

        match.complete(winner);
        if (request.playerOneScore() != null) {
            match.setPlayerOneScore(request.playerOneScore());
        }
        if (request.playerTwoScore() != null) {
            match.setPlayerTwoScore(request.playerTwoScore());
        }

        PlayerProfile loser = winner.getId().equals(match.getPlayerOne().getId())
                ? match.getPlayerTwo()
                : match.getPlayerOne();
        winner.won();
        loser.lost();
        profiles.save(winner);
        profiles.save(loser);
        syncRanking(winner);
        syncRanking(loser);

        MatchResponse response = map(matches.save(match));
        advanceRoundIfComplete(match.getTournament());
        return response;
    }

    @Transactional
    public MatchResponse updateStatus(Long id, MatchStatus status, String email) {
        GameMatch match = matches.findById(id).orElseThrow();
        verifyOrganizerOrAdmin(match.getTournament(), email);

        if (status == MatchStatus.COMPLETED) {
            throw new IllegalArgumentException("Use result endpoint to complete a match");
        }
        if (match.getStatus() == MatchStatus.COMPLETED) {
            throw new IllegalArgumentException("Cannot change status of a completed match");
        }

        match.setStatus(status);
        return map(matches.save(match));
    }

    @Transactional
    public MatchResponse createManual(MatchRequest request) {
        GameMatch match = new GameMatch();
        match.setTournament(tournaments.findById(request.tournamentId()).orElseThrow());
        match.setPlayerOne(profiles.findById(request.playerOneId()).orElseThrow());
        match.setPlayerTwo(profiles.findById(request.playerTwoId()).orElseThrow());
        match.setRoundName(request.roundName());
        match.setRoundNumber(1);
        return map(matches.save(match));
    }

    public List<MatchResponse> listPublic(Long tournamentId) {
        return matches.findByTournamentIdOrderByRoundNumberAscIdAsc(tournamentId).stream()
                .map(this::map)
                .toList();
    }

    private void advanceRoundIfComplete(Tournament tournament) {
        List<GameMatch> allMatches = matches.findByTournamentIdOrderByRoundNumberAscIdAsc(tournament.getId());
        if (allMatches.isEmpty()) {
            return;
        }

        int currentRound = allMatches.stream().mapToInt(GameMatch::getRoundNumber).max().orElse(1);
        List<GameMatch> roundMatches = allMatches.stream()
                .filter(m -> m.getRoundNumber() == currentRound)
                .toList();

        boolean roundComplete = roundMatches.stream().allMatch(m -> m.getStatus() == MatchStatus.COMPLETED);
        if (!roundComplete) {
            return;
        }

        List<PlayerProfile> winners = roundMatches.stream()
                .map(GameMatch::getWinner)
                .filter(Objects::nonNull)
                .toList();

        if (winners.size() == 1) {
            crownChampion(tournament, winners.get(0));
            return;
        }

        if (winners.size() < 2) {
            return;
        }

        int nextRound = currentRound + 1;
        if (allMatches.stream().anyMatch(m -> m.getRoundNumber() == nextRound)) {
            return;
        }

        String roundName = resolveRoundName(nextRound, winners.size());
        List<GameMatch> nextMatches = new ArrayList<>();

        for (int i = 0; i < winners.size(); i += 2) {
            if (i + 1 >= winners.size()) {
                break;
            }
            GameMatch next = new GameMatch();
            next.setTournament(tournament);
            next.setPlayerOne(winners.get(i));
            next.setPlayerTwo(winners.get(i + 1));
            next.setRoundName(roundName);
            next.setRoundNumber(nextRound);
            next.setStatus(MatchStatus.SCHEDULED);
            nextMatches.add(matches.save(next));
        }

        if (winners.size() % 2 == 1 && nextMatches.isEmpty()) {
            crownChampion(tournament, winners.get(winners.size() - 1));
        }
    }

    private void crownChampion(Tournament tournament, PlayerProfile champion) {
        if (tournament.getChampion() != null) {
            return;
        }
        tournament.setChampion(champion);
        tournament.setStatus(TournamentStatus.COMPLETED);
        tournaments.save(tournament);
        rewardService.rewardTournamentWinner(tournament, champion);
    }

    private String resolveRoundName(int roundNumber, int playerCount) {
        if (playerCount == 2) {
            return "Final";
        }
        if (playerCount == 4) {
            return "Semi-Final";
        }
        if (playerCount == 8) {
            return "Quarter-Final";
        }
        return "Round " + roundNumber;
    }

    private void syncRanking(PlayerProfile player) {
        Ranking ranking = rankings.findByPlayer(player).orElseGet(() -> {
            Ranking r = new Ranking();
            r.setPlayer(player);
            return r;
        });
        ranking.sync();
        rankings.save(ranking);
    }

    private void verifyOrganizer(Tournament tournament, String email) {
        if (!tournament.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
    }

    private void verifyOrganizerOrAdmin(Tournament tournament, String email) {
        User user = users.findByEmail(email).orElseThrow();
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        verifyOrganizer(tournament, email);
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
                m.getPlayerTwoScore());
    }
}
