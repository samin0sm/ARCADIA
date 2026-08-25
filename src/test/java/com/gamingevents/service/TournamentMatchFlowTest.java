package com.gamingevents.service;

import com.gamingevents.dto.GameDtos.PairingResponse;
import com.gamingevents.dto.GameDtos.ResultRequest;
import com.gamingevents.dto.TournamentDtos.Request;
import com.gamingevents.dto.TournamentDtos.Response;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TournamentMatchFlowTest {

    @Mock
    private TournamentRepository tournamentRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PlayerProfileRepository profileRepository;
    @Mock
    private RegistrationRepository registrationRepository;
    @Mock
    private GameMatchRepository matchRepository;
    @Mock
    private RankingRepository rankingRepository;
    @Mock
    private RewardService rewardService;

    private TournamentService tournamentService;
    private MatchService matchService;

    @BeforeEach
    void setUp() {
        tournamentService = new TournamentService(tournamentRepository, userRepository, profileRepository, registrationRepository, matchRepository);
        matchService = new MatchService(matchRepository, tournamentRepository, registrationRepository, profileRepository, rankingRepository, userRepository, rewardService);
    }

    @Test
    void createTournament_success() {
        User organizer = new User();
        organizer.setEmail("org@test.com");
        organizer.setName("Org Name");
        organizer.setRole(Role.ORGANIZER);

        when(userRepository.findByEmail("org@test.com")).thenReturn(Optional.of(organizer));
        when(tournamentRepository.save(any(Tournament.class))).thenAnswer(inv -> {
            Tournament t = inv.getArgument(0);
            return t;
        });

        Request request = new Request("Valorant Cup", "Valorant", "Fun cup", "Single Elimination", BigDecimal.ZERO, 8, Instant.now().plusSeconds(3600));
        Response response = tournamentService.create(request, "org@test.com");

        assertNotNull(response);
        assertEquals("Valorant Cup", response.name());
        assertEquals("Org Name", response.organizer());
    }

    @Test
    void generatePairings_success() {
        User organizer = new User();
        organizer.setEmail("org@test.com");

        Tournament tournament = new Tournament();
        tournament.setOrganizer(organizer);
        tournament.setStatus(TournamentStatus.UPCOMING);

        PlayerProfile p1 = new PlayerProfile();
        p1.setUsername("p1");
        PlayerProfile p2 = new PlayerProfile();
        p2.setUsername("p2");

        Registration r1 = new Registration();
        r1.setPlayer(p1);
        r1.setStatus(RegistrationStatus.APPROVED);

        Registration r2 = new Registration();
        r2.setPlayer(p2);
        r2.setStatus(RegistrationStatus.APPROVED);

        when(tournamentRepository.findById(1L)).thenReturn(Optional.of(tournament));
        when(matchRepository.existsByTournamentId(1L)).thenReturn(false);
        when(registrationRepository.findByTournamentAndStatus(tournament, RegistrationStatus.APPROVED)).thenReturn(List.of(r1, r2));
        when(matchRepository.save(any(GameMatch.class))).thenAnswer(inv -> inv.getArgument(0));

        PairingResponse response = matchService.generatePairings(1L, "org@test.com");

        assertNotNull(response);
        assertEquals(1, response.matchCount());
        assertEquals(TournamentStatus.ONGOING, tournament.getStatus());
    }
}
