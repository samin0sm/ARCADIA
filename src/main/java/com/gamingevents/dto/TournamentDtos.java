package com.gamingevents.dto;

import com.gamingevents.entity.RegistrationStatus;
import com.gamingevents.entity.TournamentStatus;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public final class TournamentDtos {
    private TournamentDtos() {}

    public record Request(
            @NotBlank String name,
            @NotBlank String gameName,
            String description,
            @NotBlank String format,
            @DecimalMin("0") BigDecimal entryFee,
            @Min(2) int maxPlayers,
            @Future Instant startDate) {}

    public record Response(
            Long id,
            String name,
            String gameName,
            String description,
            String organizer,
            String format,
            BigDecimal entryFee,
            int maxPlayers,
            int currentParticipants,
            Instant startDate,
            TournamentStatus status,
            String champion) {}

    public record MyTournamentResponse(
            Long tournamentId,
            String name,
            String gameName,
            String description,
            String format,
            TournamentStatus tournamentStatus,
            RegistrationStatus registrationStatus,
            Instant startDate,
            BigDecimal entryFee,
            int currentParticipants,
            int maxPlayers,
            String matchScheduleNote) {}

    public record JoinResponse(
            String message,
            Long tournamentId,
            String tournamentName,
            RegistrationStatus registrationStatus,
            Instant registeredAt) {}

    public record OrganizerResponse(
            Long id,
            String name,
            String gameName,
            TournamentStatus status,
            int registeredCount,
            int approvedCount,
            int matchCount,
            int completedMatchCount,
            Instant startDate) {}

    public record StatsResponse(
            Long tournamentId,
            String name,
            TournamentStatus status,
            int totalRegistrations,
            int approvedRegistrations,
            int totalMatches,
            int completedMatches,
            int scheduledMatches,
            int liveMatches,
            String champion) {}

    public record RegistrationResponse(
            Long id,
            Long playerId,
            String username,
            RegistrationStatus status,
            Instant registrationDate) {}

    public record DashboardStatsResponse(
            int hostedTournaments,
            int totalRegistrations,
            int approvedPlayers,
            int scheduledMatches,
            int completedMatches) {}
}
