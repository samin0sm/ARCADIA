package com.gamingevents.service;

import com.gamingevents.dto.AuthDtos.LoginRequest;
import com.gamingevents.dto.AuthDtos.RegisterRequest;
import com.gamingevents.dto.AuthDtos.TokenResponse;
import com.gamingevents.entity.Role;
import com.gamingevents.entity.User;
import com.gamingevents.repository.PlayerProfileRepository;
import com.gamingevents.repository.UserRepository;
import com.gamingevents.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PlayerProfileRepository profileRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, profileRepository, passwordEncoder, jwtService);
    }

    @Test
    void registerPlayer_success() {
        RegisterRequest request = new RegisterRequest("Test Player", "player@test.com", "Password123!", Role.PLAYER, "testplayer");
        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");
        when(jwtService.create(eq("player@test.com"), eq(Role.PLAYER))).thenReturn("mock-jwt-token");
        when(jwtService.expirationSeconds()).thenReturn(86400L);

        TokenResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock-jwt-token", response.accessToken());
        assertEquals("PLAYER", response.role());
        verify(userRepository).save(any(User.class));
        verify(profileRepository).save(any());
    }

    @Test
    void register_duplicateEmail_throwsConflict() {
        RegisterRequest request = new RegisterRequest("Test", "exist@test.com", "Password123!", Role.PLAYER, "test");
        when(userRepository.findByEmail("exist@test.com")).thenReturn(Optional.of(new User()));

        assertThrows(ResponseStatusException.class, () -> authService.register(request));
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest("player@test.com", "Password123!");
        User user = new User();
        user.setEmail("player@test.com");
        user.setPassword("hashedPassword");
        user.setName("Player Name");
        user.setRole(Role.PLAYER);
        user.setEnabled(true);

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password123!", "hashedPassword")).thenReturn(true);
        when(jwtService.create(eq("player@test.com"), eq(Role.PLAYER))).thenReturn("login-jwt-token");
        when(jwtService.expirationSeconds()).thenReturn(86400L);

        TokenResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("login-jwt-token", response.accessToken());
        assertEquals("Player Name", response.name());
    }

    @Test
    void login_invalidPassword_throwsUnauthorized() {
        LoginRequest request = new LoginRequest("player@test.com", "WrongPassword");
        User user = new User();
        user.setEmail("player@test.com");
        user.setPassword("hashedPassword");
        user.setEnabled(true);

        when(userRepository.findByEmail("player@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword")).thenReturn(false);

        assertThrows(ResponseStatusException.class, () -> authService.login(request));
    }
}
