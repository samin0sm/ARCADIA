package com.gamingevents.dto;

import com.gamingevents.entity.MatchStatus;
import com.gamingevents.entity.TournamentStatus;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class GameDtos {
    private GameDtos() {}

    public record ProfileRequest(
            @NotBlank(message = "Username cannot be blank")
            @Size(min = 2, max = 50, message = "Username must be between 2 and 50 characters")
            String username,
            @Size(max = 500, message = "Profile image URL is too long")
            String profileImage,
            @Size(max = 100, message = "Favorite game is too long")
            String favoriteGame,
            @Size(max = 50, message = "Skill level is too long")
            String skillLevel) {}

    public record ProfileResponse(
            Long id,
            String username,
            String profileImage,
            String favoriteGame,
            String skillLevel,
            int totalMatches,
            int wins,
            int losses,
            int rankingPoints,
            int tokenBalance) {}

    public record MatchRequest(
            @NotNull Long tournamentId,
            @NotNull Long playerOneId,
            @NotNull Long playerTwoId,
            @NotBlank String roundName) {}

    public record ResultRequest(
            @NotNull Long winnerId,
            Integer playerOneScore,
            Integer playerTwoScore) {}

    public record StatusRequest(@NotNull MatchStatus status) {}

    public record MatchResponse(
            Long id,
            Long tournamentId,
            Long playerOneId,
            String playerOne,
            Long playerTwoId,
            String playerTwo,
            Long winnerId,
            String winner,
            String roundName,
            int roundNumber,
            String status,
            Integer playerOneScore,
            Integer playerTwoScore) {}

    public record BracketResponse(
            Long tournamentId,
            String tournamentName,
            String champion,
            List<RoundResponse> rounds) {}

    public record RoundResponse(int roundNumber, String roundName, List<MatchResponse> matches) {}

    public record RankingResponse(int rank, String username, int points, int wins, int losses) {}

    public record UserStatusRequest(boolean enabled) {}

    public record PairingResponse(int matchCount, List<MatchResponse> matches) {}

    public record GameCatalogResponse(
            Long id,
            String name,
            String description,
            String iconUrl,
            String status,
            int tournamentCount) {}
}
