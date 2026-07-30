package com.gamingevents.entity;
import jakarta.persistence.*;
@Entity @Table(name="rankings") public class Ranking { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @OneToOne(optional=false) @JoinColumn(name="player_id") private PlayerProfile player; private int points,wins,losses; public Long getId(){return id;} public PlayerProfile getPlayer(){return player;} public void setPlayer(PlayerProfile v){player=v;} public int getPoints(){return points;} public void sync(){points=player.getRankingPoints();wins=player.getWins();losses=player.getLosses();} }
