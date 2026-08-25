package com.gamingevents.service;

import com.gamingevents.dto.GameDtos.GameCatalogResponse;
import com.gamingevents.dto.GameDtos.ProfileRequest;
import com.gamingevents.dto.TournamentDtos.JoinResponse;
import com.gamingevents.dto.TournamentDtos.MyTournamentResponse;
import com.gamingevents.dto.TournamentDtos.Response;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PlayerModuleTest {

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
    private GameRepository gameRepository;
    @Mock
    private RankingRepository rankingRepository;
    @Mock
    private MatchService matchService;
    @Mock
    private RewardService rewardService;

    private TournamentService tournamentService;
    private GameCatalogService gameCatalogService;
    private com.gamingevents.controller.GameController gameController;

    @BeforeEach
    void setUp() {
        tournamentService = new TournamentService(
                tournamentRepository,
                userRepository,
                profileRepository,
                registrationRepository,
                matchRepository
        );
        gameCatalogService = new GameCatalogService(gameRepository, tournamentRepository);
        gameController = new com.gamingevents.controller.GameController(
                userRepository,
                profileRepository,
                tournamentRepository,
                matchRepository,
                rankingRepository,
                matchService,
                rewardService
        );
    }

    @Nested
    @DisplayName("Player Profile Tests")
    class PlayerProfileTests {

        private User playerUser;
        private PlayerProfile playerProfile;
        private org.springframework.security.core.Authentication auth;

        @BeforeEach
        void initTestData() {
            playerUser = new User();
            playerUser.setId(10L);
            playerUser.setEmail("player@test.com");
            playerUser.setRole(Role.PLAYER);
            playerUser.setEnabled(true);

            playerProfile = new PlayerProfile();
            playerProfile.setId(20L);
            playerProfile.setUser(playerUser);
            playerProfile.setUsername("ace_gamer");
            playerProfile.setFavoriteGame("Valorant");
            playerProfile.setSkillLevel("Pro");

            auth = mock(org.springframework.security.core.Authentication.class);
            lenient().when(auth.getName()).thenReturn("player@test.com");
        }

        @Test
        @DisplayName("Get own profile successfully")
        void getProfile_authenticated_success() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));

            com.gamingevents.dto.GameDtos.ProfileResponse response = gameController.getProfile(auth);

            assertNotNull(response);
            assertEquals("ace_gamer", response.username());
            assertEquals("Valorant", response.favoriteGame());
            assertEquals("Pro", response.skillLevel());
        }

        @Test
        @DisplayName("Update own profile successfully")
        void updateProfile_valid_success() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(profileRepository.save(any(PlayerProfile.class))).thenAnswer(inv -> inv.getArgument(0));

            ProfileRequest req = new ProfileRequest("ace_new_tag", "avatar.png", "CS2", "Elite");
            com.gamingevents.dto.GameDtos.ProfileResponse response = gameController.updateProfile(auth, req);

            assertNotNull(response);
            assertEquals("ace_new_tag", response.username());
            assertEquals("CS2", response.favoriteGame());
            assertEquals("Elite", response.skillLevel());
            verify(profileRepository).save(playerProfile);
        }

        @Test
        @DisplayName("Update profile with taken username throws 409 CONFLICT")
        void updateProfile_takenUsername_throwsConflict() {
            PlayerProfile anotherProfile = new PlayerProfile();
            anotherProfile.setId(99L);
            anotherProfile.setUsername("taken_tag");

            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(profileRepository.findByUsername("taken_tag")).thenReturn(Optional.of(anotherProfile));

            ProfileRequest req = new ProfileRequest("taken_tag", null, "CS2", "Beginner");

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> gameController.updateProfile(auth, req));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Unauthenticated request (null auth) throws 401 UNAUTHORIZED")
        void getProfile_unauthenticated_throwsUnauthorized() {
            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> gameController.getProfile(null));

            assertEquals(HttpStatus.UNAUTHORIZED, ex.getStatusCode());
        }

        @Test
        @DisplayName("Disabled user profile access throws 403 FORBIDDEN")
        void getProfile_disabledUser_throwsForbidden() {
            playerUser.setEnabled(false);
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> gameController.getProfile(auth));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Games Catalog Tests")
    class GamesCatalogTests {

        @Test
        @DisplayName("List active games successfully")
        void listGames_success() {
            Game g1 = new Game("Valorant", "Tactical shooter", "icon1.png", "ACTIVE");
            g1.setId(1L);
            Game g2 = new Game("CS2", "FPS precision", "icon2.png", "ACTIVE");
            g2.setId(2L);

            when(gameRepository.findAllByStatusOrderByNameAsc("ACTIVE")).thenReturn(List.of(g1, g2));
            when(tournamentRepository.findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase(anyString(), anyString()))
                    .thenReturn(Collections.emptyList());

            List<GameCatalogResponse> result = gameCatalogService.listGames();

            assertNotNull(result);
            assertEquals(2, result.size());
            assertEquals("Valorant", result.get(0).name());
            assertEquals("CS2", result.get(1).name());
        }

        @Test
        @DisplayName("Get game by valid ID")
        void getGame_validId_success() {
            Game game = new Game("Valorant", "5v5 shooter", "icon.png", "ACTIVE");
            game.setId(1L);

            when(gameRepository.findById(1L)).thenReturn(Optional.of(game));
            when(tournamentRepository.findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase(anyString(), anyString()))
                    .thenReturn(Collections.emptyList());

            GameCatalogResponse response = gameCatalogService.getGame(1L);

            assertNotNull(response);
            assertEquals(1L, response.id());
            assertEquals("Valorant", response.name());
        }

        @Test
        @DisplayName("Get game by invalid ID throws 404 NOT_FOUND")
        void getGame_invalidId_throwsNotFound() {
            when(gameRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> gameCatalogService.getGame(999L));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Tournament Discovery Tests")
    class TournamentDiscoveryTests {

        @Test
        @DisplayName("List all tournaments")
        void listTournaments_noFilter_success() {
            User org = new User();
            org.setName("Pro Org");

            Tournament t1 = new Tournament();
            t1.setName("Apex Clash");
            t1.setGameName("Apex Legends");
            t1.setOrganizer(org);

            Tournament t2 = new Tournament();
            t2.setName("Valorant Open");
            t2.setGameName("Valorant");
            t2.setOrganizer(org);

            when(tournamentRepository.findAll()).thenReturn(List.of(t1, t2));
            when(registrationRepository.countByTournament(any())).thenReturn(0L);

            List<Response> result = tournamentService.list(null, null);

            assertEquals(2, result.size());
        }

        @Test
        @DisplayName("Filter tournaments by game")
        void listTournaments_filterByGame_success() {
            User org = new User();
            org.setName("Pro Org");

            Tournament t1 = new Tournament();
            t1.setName("Apex Clash");
            t1.setGameName("Apex Legends");
            t1.setOrganizer(org);

            Tournament t2 = new Tournament();
            t2.setName("Valorant Open");
            t2.setGameName("Valorant");
            t2.setOrganizer(org);

            when(tournamentRepository.findAll()).thenReturn(List.of(t1, t2));
            when(registrationRepository.countByTournament(any())).thenReturn(0L);

            List<Response> result = tournamentService.list(null, "Valorant");

            assertEquals(1, result.size());
            assertEquals("Valorant Open", result.get(0).name());
        }

        @Test
        @DisplayName("Search tournaments by name")
        void listTournaments_searchQuery_success() {
            User org = new User();
            org.setName("Pro Org");

            Tournament t1 = new Tournament();
            t1.setName("Apex Clash");
            t1.setGameName("Apex Legends");
            t1.setOrganizer(org);

            Tournament t2 = new Tournament();
            t2.setName("Valorant Open");
            t2.setGameName("Valorant");
            t2.setOrganizer(org);

            when(tournamentRepository.findAll()).thenReturn(List.of(t1, t2));
            when(registrationRepository.countByTournament(any())).thenReturn(0L);

            List<Response> result = tournamentService.list("clash", null);

            assertEquals(1, result.size());
            assertEquals("Apex Clash", result.get(0).name());
        }

        @Test
        @DisplayName("Get tournament by valid ID")
        void getTournament_validId_success() {
            User org = new User();
            org.setName("Major League");

            Tournament t = new Tournament();
            t.setName("Major Valorant Cup");
            t.setGameName("Valorant");
            t.setOrganizer(org);

            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(t));
            when(registrationRepository.countByTournament(t)).thenReturn(4L);

            Response response = tournamentService.get(1L);

            assertNotNull(response);
            assertEquals("Major Valorant Cup", response.name());
            assertEquals(4, response.currentParticipants());
        }

        @Test
        @DisplayName("Get tournament by invalid ID throws 404 NOT_FOUND")
        void getTournament_invalidId_throwsNotFound() {
            when(tournamentRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.get(999L));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("Tournament Registration (Join) Tests")
    class TournamentRegistrationTests {

        private User playerUser;
        private PlayerProfile playerProfile;
        private Tournament upcomingTournament;

        @BeforeEach
        void initTestData() {
            playerUser = new User();
            playerUser.setId(10L);
            playerUser.setEmail("player@test.com");
            playerUser.setRole(Role.PLAYER);
            playerUser.setEnabled(true);

            playerProfile = new PlayerProfile();
            playerProfile.setId(20L);
            playerProfile.setUser(playerUser);
            playerProfile.setUsername("ace_player");

            upcomingTournament = new Tournament();
            upcomingTournament.setName("CS2 Championship");
            upcomingTournament.setGameName("CS2");
            upcomingTournament.setStatus(TournamentStatus.UPCOMING);
            upcomingTournament.setMaxPlayers(8);
            upcomingTournament.setStartDate(Instant.now().plusSeconds(7200));
        }

        @Test
        @DisplayName("Successful tournament registration")
        void join_success() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(upcomingTournament));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(registrationRepository.existsByPlayerAndTournament(playerProfile, upcomingTournament)).thenReturn(false);
            when(registrationRepository.countByTournament(upcomingTournament)).thenReturn(2L);
            when(registrationRepository.save(any(Registration.class))).thenAnswer(inv -> inv.getArgument(0));

            JoinResponse response = tournamentService.join(1L, "player@test.com");

            assertNotNull(response);
            assertEquals(RegistrationStatus.REGISTERED, response.registrationStatus());
            verify(registrationRepository).save(any(Registration.class));
        }

        @Test
        @DisplayName("Duplicate registration throws 409 CONFLICT")
        void join_duplicate_throwsConflict() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(upcomingTournament));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(registrationRepository.existsByPlayerAndTournament(playerProfile, upcomingTournament)).thenReturn(true);

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "player@test.com"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Tournament already full throws 409 CONFLICT")
        void join_tournamentFull_throwsConflict() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(upcomingTournament));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(registrationRepository.existsByPlayerAndTournament(playerProfile, upcomingTournament)).thenReturn(false);
            when(registrationRepository.countByTournament(upcomingTournament)).thenReturn(8L); // max is 8

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "player@test.com"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Tournament not open for registration throws 409 CONFLICT")
        void join_closedTournament_throwsConflict() {
            upcomingTournament.setStatus(TournamentStatus.ONGOING);

            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(upcomingTournament));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "player@test.com"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Registration deadline passed throws 409 CONFLICT")
        void join_deadlinePassed_throwsConflict() {
            upcomingTournament.setStartDate(Instant.now().minusSeconds(3600));

            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(1L)).thenReturn(Optional.of(upcomingTournament));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "player@test.com"));

            assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        }

        @Test
        @DisplayName("Invalid tournament ID throws 404 NOT_FOUND")
        void join_invalidTournamentId_throwsNotFound() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(tournamentRepository.findById(999L)).thenReturn(Optional.empty());

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(999L, "player@test.com"));

            assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
        }

        @Test
        @DisplayName("ORGANIZER attempting player registration throws 403 FORBIDDEN")
        void join_organizerRole_throwsForbidden() {
            User organizerUser = new User();
            organizerUser.setEmail("org@test.com");
            organizerUser.setRole(Role.ORGANIZER);
            organizerUser.setEnabled(true);

            when(userRepository.findByEmail("org@test.com")).thenReturn(Optional.of(organizerUser));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "org@test.com"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }

        @Test
        @DisplayName("Disabled user attempting registration throws 403 FORBIDDEN")
        void join_disabledUser_throwsForbidden() {
            playerUser.setEnabled(false);

            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));

            ResponseStatusException ex = assertThrows(ResponseStatusException.class,
                    () -> tournamentService.join(1L, "player@test.com"));

            assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
        }
    }

    @Nested
    @DisplayName("My Tournaments Tests")
    class MyTournamentsTests {

        private User playerUser;
        private PlayerProfile playerProfile;

        @BeforeEach
        void initTestData() {
            playerUser = new User();
            playerUser.setId(10L);
            playerUser.setEmail("player@test.com");
            playerUser.setRole(Role.PLAYER);

            playerProfile = new PlayerProfile();
            playerProfile.setId(20L);
            playerProfile.setUser(playerUser);
        }

        @Test
        @DisplayName("Authenticated player retrieves registered tournaments")
        void myTournaments_authenticated_success() {
            Tournament t = new Tournament();
            t.setName("Apex Master");
            t.setGameName("Apex Legends");
            t.setStatus(TournamentStatus.UPCOMING);
            t.setMaxPlayers(16);

            Registration r = new Registration();
            r.setTournament(t);
            r.setPlayer(playerProfile);
            r.setStatus(RegistrationStatus.REGISTERED);

            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(registrationRepository.findByPlayer(playerProfile)).thenReturn(List.of(r));
            when(registrationRepository.countByTournament(t)).thenReturn(1L);

            List<MyTournamentResponse> list = tournamentService.myTournaments("player@test.com");

            assertNotNull(list);
            assertEquals(1, list.size());
            assertEquals("Apex Master", list.get(0).name());
            assertEquals("Matches will appear when the tournament schedule is published.", list.get(0).matchScheduleNote());
        }

        @Test
        @DisplayName("Authenticated player with no registrations returns empty list")
        void myTournaments_emptyList_success() {
            when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
            when(profileRepository.findByUserId(10L)).thenReturn(Optional.of(playerProfile));
            when(registrationRepository.findByPlayer(playerProfile)).thenReturn(Collections.emptyList());

            List<MyTournamentResponse> list = tournamentService.myTournaments("player@test.com");

            assertNotNull(list);
            assertTrue(list.isEmpty());
        }
    }
}
