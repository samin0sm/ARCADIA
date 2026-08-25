package com.gamingevents.service;

import com.gamingevents.dto.TournamentDtos.*;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
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
        t.setStatus(TournamentStatus.UPCOMING);
        t.setOrganizer(users.findByEmail(email.toLowerCase()).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Organizer not found")));
        return map(tournaments.save(t));
    }

    public List<Response> list(String q, String game) {
        List<Tournament> list = tournaments.findAll();

        if (game != null && !game.isBlank()) {
            list = list.stream()
                    .filter(t -> t.getGameName() != null && t.getGameName().equalsIgnoreCase(game.trim()))
                    .toList();
        }

        if (q != null && !q.isBlank()) {
            String query = q.trim().toLowerCase();
            list = list.stream()
                    .filter(t -> (t.getName() != null && t.getName().toLowerCase().contains(query))
                            || (t.getGameName() != null && t.getGameName().toLowerCase().contains(query)))
                    .toList();
        }

        return list.stream().map(this::map).toList();
    }

    public Response get(Long id) {
        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));
        return map(t);
    }

    private void verifyOrganizerOrAdmin(Tournament tournament, String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        if (user.getRole() == Role.ADMIN) {
            return;
        }
        if (!tournament.getOrganizer().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this tournament");
        }
    }

    public Response update(Long id, Request r, String email) {
        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));
        verifyOrganizerOrAdmin(t, email);
        copy(t, r);
        return map(tournaments.save(t));
    }

    public void delete(Long id, String email) {
        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));
        verifyOrganizerOrAdmin(t, email);
        tournaments.delete(t);
    }

    @Transactional
    public JoinResponse join(Long id, String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));

        if (!user.isEnabled()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is disabled");
        }

        if (user.getRole() != Role.PLAYER) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only players can register for tournaments");
        }

        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));

        if (t.getStatus() != TournamentStatus.UPCOMING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament registration is closed (status: " + t.getStatus() + ")");
        }

        if (t.getStartDate() != null && t.getStartDate().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Registration deadline has passed");
        }

        PlayerProfile p = profiles.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Player profile required"));

        if (registrations.existsByPlayerAndTournament(p, t)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You are already registered for this tournament");
        }

        if (registrations.countByTournament(t) >= t.getMaxPlayers()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Tournament is already full (Max: " + t.getMaxPlayers() + ")");
        }

        Registration r = new Registration();
        r.setPlayer(p);
        r.setTournament(t);
        r.setStatus(RegistrationStatus.REGISTERED);
        r.setRegistrationDate(Instant.now());
        registrations.save(r);

        return new JoinResponse(
                "Registration confirmed! You have joined " + t.getName(),
                t.getId(),
                t.getName(),
                r.getStatus(),
                r.getRegistrationDate()
        );
    }

    public List<MyTournamentResponse> myTournaments(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required"));
        PlayerProfile profile = profiles.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.FORBIDDEN, "Player profile required"));

        return registrations.findByPlayer(profile).stream()
                .map(r -> {
                    Tournament t = r.getTournament();
                    return new MyTournamentResponse(
                            t.getId(),
                            t.getName(),
                            t.getGameName(),
                            t.getDescription(),
                            t.getFormat(),
                            t.getStatus(),
                            r.getStatus(),
                            t.getStartDate(),
                            t.getEntryFee(),
                            (int) registrations.countByTournament(t),
                            t.getMaxPlayers(),
                            "Matches will appear when the tournament schedule is published."
                    );
                })
                .toList();
    }

    public List<OrganizerResponse> listForOrganizer(String email) {
        User user = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        List<Tournament> list = (user.getRole() == Role.ADMIN)
                ? tournaments.findAll()
                : tournaments.findByOrganizer(user);
        return list.stream().map(this::mapOrganizer).toList();
    }

    public StatsResponse getStats(Long id, String email) {
        Tournament t = tournaments.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + id));
        verifyOrganizerOrAdmin(t, email);
        return buildStats(t);
    }

    public DashboardStatsResponse getDashboardStats(String email) {
        User organizer = users.findByEmail(email).orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
        List<Tournament> hosted = (organizer.getRole() == Role.ADMIN)
                ? tournaments.findAll()
                : tournaments.findByOrganizer(organizer);

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
        Registration registration = registrations.findById(registrationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Registration not found with ID: " + registrationId));
        Tournament tournament = registration.getTournament();
        verifyOrganizerOrAdmin(tournament, email);
        if (registration.getStatus() == RegistrationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot approve a cancelled registration");
        }
        registration.setStatus(RegistrationStatus.APPROVED);
        registrations.save(registration);
        return mapRegistration(registration);
    }

    public List<RegistrationResponse> getRegistrations(Long tournamentId, String email) {
        Tournament t = tournaments.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + tournamentId));
        verifyOrganizerOrAdmin(t, email);
        return registrations.findByTournament(t).stream().map(this::mapRegistration).toList();
    }

    public List<RegistrationResponse> getPublicRoster(Long tournamentId) {
        Tournament t = tournaments.findById(tournamentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Tournament not found with ID: " + tournamentId));
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
                t.getDescription(),
                t.getOrganizer().getName(),
                t.getFormat(),
                t.getEntryFee(),
                t.getMaxPlayers(),
                (int) registrations.countByTournament(t),
                t.getStartDate(),
                t.getStatus(),
                t.getChampion() != null ? t.getChampion().getUsername() : null);
    }
}
