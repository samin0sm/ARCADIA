package com.gamingevents.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "games")
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(nullable = false)
    private String status = "ACTIVE";

    public Game() {}

    public Game(String name, String description, String iconUrl, String status) {
        this.name = name;
        this.description = description;
        this.iconUrl = iconUrl;
        this.status = status;
    }

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public String getIconUrl() { return iconUrl; }

    public void setIconUrl(String iconUrl) { this.iconUrl = iconUrl; }

    public String getStatus() { return status; }

    public void setStatus(String status) { this.status = status; }
}
