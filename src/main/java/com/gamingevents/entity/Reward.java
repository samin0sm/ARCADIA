package com.gamingevents.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "rewards")
public class Reward {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player_id")
    private PlayerProfile player;

    @ManyToOne
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    private String rewardType;
    private int amount;

    @Column(nullable = false)
    private String transactionId;

    private Instant createdAt = Instant.now();

    public Long getId() { return id; }

    public PlayerProfile getPlayer() { return player; }

    public void setPlayer(PlayerProfile p) { player = p; }

    public Tournament getTournament() { return tournament; }

    public void setTournament(Tournament t) { tournament = t; }

    public String getRewardType() { return rewardType; }

    public void setRewardType(String t) { rewardType = t; }

    public int getAmount() { return amount; }

    public void setAmount(int a) { amount = a; }

    public String getTransactionId() { return transactionId; }

    public void setTransactionId(String t) { transactionId = t; }

    public Instant getCreatedAt() { return createdAt; }
}
