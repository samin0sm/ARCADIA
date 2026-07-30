package com.gamingevents.entity;
import jakarta.persistence.*;

@Entity @Table(name="player_profiles")
public class PlayerProfile { @Id @GeneratedValue(strategy=GenerationType.IDENTITY)
private Long id; @OneToOne(optional=false) @JoinColumn(name="user_id") private User user;

@Column(nullable=false,unique=true)
private String username;
private String profileImage;
private String favoriteGame;
private String skillLevel;
private int totalMatches,wins,losses,rankingPoints;
public Long getId(){return id;} public User getUser(){return user;} public void setUser(User v){user=v;} public String getUsername(){return username;} public void setUsername(String v){username=v;} public String getProfileImage(){return profileImage;} public void setProfileImage(String v){profileImage=v;} public String getFavoriteGame(){return favoriteGame;} public void setFavoriteGame(String v){favoriteGame=v;} public String getSkillLevel(){return skillLevel;} public void setSkillLevel(String v){skillLevel=v;} public int getTotalMatches(){return totalMatches;} public int getWins(){return wins;} public int getLosses(){return losses;} public int getRankingPoints(){return rankingPoints;} public void won(){totalMatches++;wins++;rankingPoints+=3;} public void lost(){totalMatches++;losses++;} }
