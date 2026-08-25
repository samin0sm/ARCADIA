# ARCADIA — Gaming Event & Tournament Platform

ARCADIA is an esports gaming event management platform supporting full lifecycle tournament operations, single-elimination bracket generation, real-time match refereeing, player ranking leaderboards, token rewards, and an in-platform perks store.

---

## 🏗️ Architecture Overview

```
                         ARCADIA PLATFORM
                                 │
                 ┌───────────────┼───────────────┐
                 ▼               ▼               ▼
            PLAYER           ORGANIZER         ADMIN
             ROLE              ROLE            ROLE
                 │               │               │
        ┌────────┴────────┐      │        ┌──────┴──────┐
        ▼                 ▼      ▼        ▼             ▼
     Gamer             Browse  Create   User        Platform
    Profile             Games  Events   Control    Moderation
        │                 │      │        │             │
        └────────┬────────┘      │        └──────┬──────┘
                 ▼               ▼               ▼
             Discover        Applicants       Overview
            Tournaments      & Approval        Stats
                 │               │
                 └───────┬───────┘
                         ▼
                     Single Elimination
                      Brackets & Matches
                         │
                         ▼
                    Match Scores &
                  Champion Crowning
                         │
                 ┌───────┴───────┐
                 ▼               ▼
              Global         +100 Tokens
            Leaderboard     Rewards Wallet
                                 │
                                 ▼
                           Rewards Store
                           & Perk Inventory
```

---

## ⚡ Tech Stack

* **Backend**: Java 17 LTS, Spring Boot 3.4.2, Spring Security 6, Spring Data JPA, JJWT 0.12.6, Flyway Migrations, Swagger/OpenAPI 3.
* **Frontend**: React 18, Vite, React Router 6, Axios, Vanilla CSS with Cyberpunk/Esports design system.
* **Database**: PostgreSQL 16 (with Flyway database migrations `V1` to `V6`).
* **Containerization**: Docker & Docker Compose (multi-stage builds with Eclipse Temurin JRE and Nginx Alpine reverse proxy).
* **CI/CD**: GitHub Actions pipeline for automated Maven test suite execution and Vite bundle compilation.

---

## 🚀 Quick Start with Docker (Production Mode)

To start the entire application (Database + Backend + Frontend) in one command:

```bash
docker compose up --build -d
```

* **Frontend Web App**: [http://localhost:3000](http://localhost:3000) (or [http://localhost](http://localhost))
* **Backend API & Swagger Docs**: [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)
* **PostgreSQL Database**: `localhost:5432` (`gaming_events` db)

To stop all services:
```bash
docker compose down
```

---

## 💻 Local Development Setup

### 1. Database (Docker)
```bash
docker compose up -d postgres
```

### 2. Backend (Spring Boot 3 / Java 17)
```bash
# Windows
.\mvnw.cmd clean spring-boot:run

# Linux / macOS
./mvnw clean spring-boot:run
```

### 3. Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs locally at `http://localhost:5173`.

---

## 🔑 Default User Accounts

| Role | Email | Password | Permissions |
|---|---|---|---|
| **ADMIN** | `admin@gamingevents.local` | `Password123!` | Full platform administration, user blocking, tournament moderation |
| **ORGANIZER** | `organizer@gamingevents.local` | `Password123!` | Create tournaments, approve players, generate brackets, report scores |
| **PLAYER** | `player@gamingevents.local` | `Password123!` | Profile management, browse games, join tournaments, token rewards & shop |

---

## 📡 API Endpoints Summary

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Register player or organizer account
* `POST /api/auth/login` — Login and receive JWT access token
* `GET /api/auth/me` — Get current authenticated user details

### Games Catalog (`/api/games`)
* `GET /api/games` — List all active esports titles with active tournament count
* `GET /api/games/{id}` — Get single game details

### Player Module (`/api/players`)
* `GET /api/players/profile` — Get authenticated player's career profile & stats
* `PUT /api/players/profile` — Update gamer tag, avatar, favorite game, and skill tier
* `GET /api/players/tournaments` — List tournaments joined by authenticated player

### Tournament Discovery & Hosting (`/api/tournaments`)
* `GET /api/tournaments` — Discover tournaments (supports `?search=` and `?game=`)
* `GET /api/tournaments/{id}` — View full tournament details & rules
* `POST /api/tournaments` — Create tournament (`ORGANIZER`, `ADMIN`)
* `POST /api/tournaments/{id}/join` — Join tournament (`PLAYER`)
* `GET /api/tournaments/my` — List player's joined tournaments
* `GET /api/tournaments/{id}/registrations` — View applicant registrations (`ORGANIZER`)
* `PUT /api/tournaments/registrations/{id}/approve` — Approve participant (`ORGANIZER`)
* `POST /api/tournaments/{id}/pairings` — Generate elimination bracket pairings (`ORGANIZER`)
* `GET /api/tournaments/{id}/bracket` — View tournament elimination bracket tree

### Match Management (`/api/matches`)
* `GET /api/matches/{id}` — Get single match details
* `PUT /api/matches/{id}/status` — Update match status (`SCHEDULED`, `LIVE`)
* `PUT /api/matches/{id}/result` — Submit match result & scores (triggers automated round progression and champion crowning)

### Rankings & Leaderboard (`/api/rankings`)
* `GET /api/rankings` — Global leaderboard sorted by ranking points, win rate, and total wins

### Rewards & Wallet (`/api/rewards`)
* `GET /api/rewards/balance` — Current player token balance
* `GET /api/rewards/history` — Itemized transaction history with UUID transaction hashes

### Rewards Shop & Inventory (`/api/shop`)
* `GET /api/shop/items` — List active shop items & ownership status
* `POST /api/shop/purchase/{id}` — Purchase item with player token balance
* `GET /api/shop/inventory` — List player's unlocked badges, perks, and frames

### Admin Center (`/api/admin`)
* `GET /api/admin/stats` — Platform health metrics and totals
* `GET /api/admin/users` — User management directory
* `PUT /api/admin/users/{id}/status` — Toggle user activation status (enable / block)
* `GET /api/admin/tournaments` — Tournament moderation list
* `PUT /api/admin/tournaments/{id}/approve` — Approve pending tournament
* `DELETE /api/admin/tournaments/{id}` — Remove tournament

---

## 🧪 Automated Testing

To run the full backend unit & integration test suite:

```bash
# Windows
.\mvnw.cmd clean test

# Linux / macOS
./mvnw clean test
```

To build and verify the frontend production bundle:
```bash
cd frontend
npm run build
```
