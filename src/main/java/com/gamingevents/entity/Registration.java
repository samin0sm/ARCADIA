package com.gamingevents.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "registrations", uniqueConstraints = @UniqueConstraint(columnNames = {"player_id", "tournament_id"}))
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player_id")
    private PlayerProfile player;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @Column(nullable = false)
    private Instant registrationDate = Instant.now();

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

    public Long getId() { return id; }

    public PlayerProfile getPlayer() { return player; }

    public void setPlayer(PlayerProfile v) { player = v; }

    public Tournament getTournament() { return tournament; }

    public void setTournament(Tournament v) { tournament = v; }

    public RegistrationStatus getStatus() { return status; }

    public void setStatus(RegistrationStatus v) { status = v; }

    public Instant getRegistrationDate() { return registrationDate; }

    public void setRegistrationDate(Instant v) { registrationDate = v; }
}
