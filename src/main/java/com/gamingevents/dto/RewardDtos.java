package com.gamingevents.dto;

import java.time.Instant;
import java.util.List;

public final class RewardDtos {
    private RewardDtos() {}

    public record RewardResponse(
            Long id,
            String transactionId,
            String tournament,
            Long tournamentId,
            String winner,
            int amount,
            String rewardType,
            Instant date,
            int currentBalance) {}

    public record BalanceResponse(int balance, List<RewardResponse> history) {}
}
