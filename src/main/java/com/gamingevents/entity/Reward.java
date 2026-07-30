package com.gamingevents.entity;
import jakarta.persistence.*; import java.time.Instant;
@Entity @Table(name="rewards") public class Reward { @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id; @ManyToOne(optional=false) @JoinColumn(name="player_id") private PlayerProfile player; private String rewardType; private int amount; private Instant createdAt=Instant.now(); public void setPlayer(PlayerProfile p){player=p;} public void setRewardType(String t){rewardType=t;} public void setAmount(int a){amount=a;} }
