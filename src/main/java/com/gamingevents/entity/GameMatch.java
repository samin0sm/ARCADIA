package com.gamingevents.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "matches")
public class GameMatch {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "tournament_id")
    private Tournament tournament;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player_one_id")
    private PlayerProfile playerOne;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player_two_id")
    private PlayerProfile playerTwo;

    @ManyToOne
    @JoinColumn(name = "winner_id")
    private PlayerProfile winner;

    @Column(nullable = false)
    private String roundName;

    @Column(nullable = false)
    private int roundNumber = 1;

    @Enumerated(EnumType.STRING)
    private MatchStatus status = MatchStatus.SCHEDULED;

    private Integer playerOneScore;
    private Integer playerTwoScore;

    public Long getId() { return id; }

    public Tournament getTournament() { return tournament; }

    public void setTournament(Tournament v) { tournament = v; }

    public PlayerProfile getPlayerOne() { return playerOne; }

    public void setPlayerOne(PlayerProfile v) { playerOne = v; }

    public PlayerProfile getPlayerTwo() { return playerTwo; }

    public void setPlayerTwo(PlayerProfile v) { playerTwo = v; }

    public PlayerProfile getWinner() { return winner; }

    public void complete(PlayerProfile v) {
        winner = v;
        status = MatchStatus.COMPLETED;
    }

    public String getRoundName() { return roundName; }

    public void setRoundName(String v) { roundName = v; }

    public int getRoundNumber() { return roundNumber; }

    public void setRoundNumber(int v) { roundNumber = v; }

    public MatchStatus getStatus() { return status; }

    public void setStatus(MatchStatus v) { status = v; }

    public Integer getPlayerOneScore() { return playerOneScore; }

    public void setPlayerOneScore(Integer v) { playerOneScore = v; }

    public Integer getPlayerTwoScore() { return playerTwoScore; }

    public void setPlayerTwoScore(Integer v) { playerTwoScore = v; }
}
