package com.gamingevents.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "tournaments")
public class Tournament {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "organizer_id")
    private User organizer;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String gameName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String format;

    @Column(nullable = false)
    private BigDecimal entryFee = BigDecimal.ZERO;

    @Column(nullable = false)
    private int maxPlayers;

    @Column(nullable = false)
    private Instant startDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TournamentStatus status = TournamentStatus.UPCOMING;

    @ManyToOne
    @JoinColumn(name = "champion_id")
    private PlayerProfile champion;

    @Column(nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }

    public void setId(Long v) { id = v; }

    public User getOrganizer() { return organizer; }

    public void setOrganizer(User v) { organizer = v; }

    public String getName() { return name; }

    public void setName(String v) { name = v; }

    public String getGameName() { return gameName; }

    public void setGameName(String v) { gameName = v; }

    public String getDescription() { return description; }

    public void setDescription(String v) { description = v; }

    public String getFormat() { return format; }

    public void setFormat(String v) { format = v; }

    public BigDecimal getEntryFee() { return entryFee; }

    public void setEntryFee(BigDecimal v) { entryFee = v; }

    public int getMaxPlayers() { return maxPlayers; }

    public void setMaxPlayers(int v) { maxPlayers = v; }

    public Instant getStartDate() { return startDate; }

    public void setStartDate(Instant v) { startDate = v; }

    public TournamentStatus getStatus() { return status; }

    public void setStatus(TournamentStatus v) { status = v; }

    public PlayerProfile getChampion() { return champion; }

    public void setChampion(PlayerProfile v) { champion = v; }
}
