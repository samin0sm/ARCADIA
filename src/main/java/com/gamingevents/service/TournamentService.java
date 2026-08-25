package com.gamingevents.service;

import com.gamingevents.dto.TournamentDtos.*;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TournamentService {
    private final TournamentRepository tournaments;
    private final UserRepository users;
    private final PlayerProfileRepository profiles;
    private final RegistrationRepository registrations;
    private final GameMatchRepository matches;

    public TournamentService(
            TournamentRepository t,
            UserRepository u,
            PlayerProfileRepository p,
            RegistrationRepository r,
            GameMatchRepository m) {
        tournaments = t;
        users = u;
        profiles = p;
        registrations = r;
        matches = m;
    }

    public Response create(Request r, String email) {
        Tournament t = new Tournament();
        copy(t, r);
        t.setOrganizer(users.findByEmail(email).orElseThrow());
        return map(tournaments.save(t));
    }

    public List<Response> list(String q) {
        return (q == null || q.isBlank()
                ? tournaments.findAll()
                : tournaments.findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase(q, q))
                .stream()
                .map(this::map)
                .toList();
    }

    public Response get(Long id) {
        return map(tournaments.findById(id).orElseThrow());
    }

    public Response update(Long id, Request r, String email) {
        Tournament t = tournaments.findById(id).orElseThrow();
        if (!t.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
        copy(t, r);
        return map(tournaments.save(t));
    }

    public void delete(Long id, String email) {
        Tournament t = tournaments.findById(id).orElseThrow();
        if (!t.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
        tournaments.delete(t);
    }

    @Transactional
    public void join(Long id, String email) {
        Tournament t = tournaments.findById(id).orElseThrow();
        if (t.getStatus() != TournamentStatus.UPCOMING) {
            throw new IllegalArgumentException("Tournament is not open for registration");
        }
        PlayerProfile p = profiles.findByUserId(users.findByEmail(email).orElseThrow().getId())
                .orElseThrow(() -> new IllegalArgumentException("Player profile required"));
        if (registrations.existsByPlayerAndTournament(p, t)) {
            throw new IllegalArgumentException("Already registered");
        }
        if (registrations.countByTournament(t) >= t.getMaxPlayers()) {
            throw new IllegalArgumentException("Tournament is full");
        }
        Registration r = new Registration();
        r.setPlayer(p);
        r.setTournament(t);
        registrations.save(r);
    }

    public List<OrganizerResponse> listForOrganizer(String email) {
        User organizer = users.findByEmail(email).orElseThrow();
        return tournaments.findByOrganizer(organizer).stream().map(this::mapOrganizer).toList();
    }

    public StatsResponse getStats(Long id, String email) {
        Tournament t = tournaments.findById(id).orElseThrow();
        if (!t.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
        return buildStats(t);
    }

    public DashboardStatsResponse getDashboardStats(String email) {
        User organizer = users.findByEmail(email).orElseThrow();
        List<Tournament> hosted = tournaments.findByOrganizer(organizer);

        int totalRegistrations = 0;
        int approvedPlayers = 0;
        int scheduledMatches = 0;
        int completedMatches = 0;

        for (Tournament t : hosted) {
            totalRegistrations += registrations.countByTournament(t);
            approvedPlayers += registrations.countByTournamentAndStatus(t, RegistrationStatus.APPROVED);
            scheduledMatches += matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.SCHEDULED);
            completedMatches += matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.COMPLETED);
        }

        return new DashboardStatsResponse(
                hosted.size(),
                totalRegistrations,
                approvedPlayers,
                scheduledMatches,
                completedMatches);
    }

    @Transactional
    public RegistrationResponse approveRegistration(Long registrationId, String email) {
        Registration registration = registrations.findById(registrationId).orElseThrow();
        Tournament tournament = registration.getTournament();
        if (!tournament.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot approve a cancelled registration");
        }
        registration.setStatus(RegistrationStatus.APPROVED);
        registrations.save(registration);
        return mapRegistration(registration);
    }

    public List<RegistrationResponse> getRegistrations(Long tournamentId, String email) {
        Tournament t = tournaments.findById(tournamentId).orElseThrow();
        if (!t.getOrganizer().getEmail().equals(email)) {
            throw new IllegalArgumentException("You do not own this tournament");
        }
        return registrations.findByTournament(t).stream().map(this::mapRegistration).toList();
    }

    public List<RegistrationResponse> getPublicRoster(Long tournamentId) {
        Tournament t = tournaments.findById(tournamentId).orElseThrow();
        return registrations.findByTournament(t).stream()
                .filter(r -> r.getStatus() != RegistrationStatus.CANCELLED)
                .map(this::mapRegistration)
                .toList();
    }

    private StatsResponse buildStats(Tournament t) {
        return new StatsResponse(
                t.getId(),
                t.getName(),
                t.getStatus(),
                (int) registrations.countByTournament(t),
                (int) registrations.countByTournamentAndStatus(t, RegistrationStatus.APPROVED),
                (int) matches.findByTournamentId(t.getId()).size(),
                (int) matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.COMPLETED),
                (int) matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.SCHEDULED),
                (int) matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.LIVE),
                t.getChampion() != null ? t.getChampion().getUsername() : null);
    }

    private OrganizerResponse mapOrganizer(Tournament t) {
        return new OrganizerResponse(
                t.getId(),
                t.getName(),
                t.getGameName(),
                t.getStatus(),
                (int) registrations.countByTournament(t),
                (int) registrations.countByTournamentAndStatus(t, RegistrationStatus.APPROVED),
                matches.findByTournamentId(t.getId()).size(),
                (int) matches.countByTournamentIdAndStatus(t.getId(), MatchStatus.COMPLETED),
                t.getStartDate());
    }

    private RegistrationResponse mapRegistration(Registration r) {
        return new RegistrationResponse(
                r.getId(),
                r.getPlayer().getId(),
                r.getPlayer().getUsername(),
                r.getStatus(),
                r.getRegistrationDate());
    }

    private void copy(Tournament t, Request r) {
        t.setName(r.name());
        t.setGameName(r.gameName());
        t.setDescription(r.description());
        t.setFormat(r.format());
        t.setEntryFee(r.entryFee());
        t.setMaxPlayers(r.maxPlayers());
        t.setStartDate(r.startDate());
    }

    private Response map(Tournament t) {
        return new Response(
                t.getId(),
                t.getName(),
                t.getGameName(),
                t.getOrganizer().getName(),
                t.getEntryFee(),
                t.getMaxPlayers(),
                t.getStartDate(),
                t.getStatus(),
                t.getChampion() != null ? t.getChampion().getUsername() : null);
    }
}
