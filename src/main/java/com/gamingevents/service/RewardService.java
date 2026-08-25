package com.gamingevents.service;

import com.gamingevents.dto.RewardDtos.BalanceResponse;
import com.gamingevents.dto.RewardDtos.RewardResponse;
import com.gamingevents.entity.PlayerProfile;
import com.gamingevents.entity.Reward;
import com.gamingevents.entity.Tournament;
import com.gamingevents.repository.PlayerProfileRepository;
import com.gamingevents.repository.RewardRepository;
import com.gamingevents.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class RewardService {
    private static final int TOURNAMENT_WIN_REWARD = 100;

    private final RewardRepository rewards;
    private final PlayerProfileRepository profiles;
    private final UserRepository users;

    public RewardService(RewardRepository rewards, PlayerProfileRepository profiles, UserRepository users) {
        this.rewards = rewards;
        this.profiles = profiles;
        this.users = users;
    }

    @Transactional
    public RewardResponse rewardTournamentWinner(Tournament tournament, PlayerProfile winner) {
        Reward existing = rewards.findByPlayerOrderByCreatedAtDesc(winner).stream()
                .filter(r -> r.getTournament() != null && r.getTournament().getId().equals(tournament.getId()))
                .findFirst()
                .orElse(null);

        if (existing != null) {
            return map(existing, winner.getTokenBalance());
        }

        winner.addTokens(TOURNAMENT_WIN_REWARD);
        profiles.save(winner);

        Reward reward = new Reward();
        reward.setPlayer(winner);
        reward.setTournament(tournament);
        reward.setRewardType("TOURNAMENT_WIN");
        reward.setAmount(TOURNAMENT_WIN_REWARD);
        reward.setTransactionId(UUID.randomUUID().toString());
        return map(rewards.save(reward), winner.getTokenBalance());
    }

    public BalanceResponse getHistory(String email) {
        PlayerProfile profile = profiles.findByUserId(
                users.findByEmail(email).orElseThrow().getId()).orElseThrow();
        List<RewardResponse> history = rewards.findByPlayerOrderByCreatedAtDesc(profile).stream()
                .map(r -> map(r, profile.getTokenBalance()))
                .toList();
        return new BalanceResponse(profile.getTokenBalance(), history);
    }

    public int getBalance(String email) {
        return profiles.findByUserId(users.findByEmail(email).orElseThrow().getId())
                .orElseThrow()
                .getTokenBalance();
    }

    private RewardResponse map(Reward reward, int currentBalance) {
        return new RewardResponse(
                reward.getId(),
                reward.getTransactionId(),
                reward.getTournament() != null ? reward.getTournament().getName() : "Platform",
                reward.getTournament() != null ? reward.getTournament().getId() : null,
                reward.getPlayer().getUsername(),
                reward.getAmount(),
                reward.getRewardType(),
                reward.getCreatedAt(),
                currentBalance);
    }
}
