package com.gamingevents.service;

import com.gamingevents.dto.GameDtos.GameCatalogResponse;
import com.gamingevents.entity.Game;
import com.gamingevents.repository.GameRepository;
import com.gamingevents.repository.TournamentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class GameCatalogService {

    private final GameRepository gameRepository;
    private final TournamentRepository tournamentRepository;

    public GameCatalogService(GameRepository gameRepository, TournamentRepository tournamentRepository) {
        this.gameRepository = gameRepository;
        this.tournamentRepository = tournamentRepository;
    }

    public List<GameCatalogResponse> listGames() {
        return gameRepository.findAllByStatusOrderByNameAsc("ACTIVE").stream()
                .map(this::mapGame)
                .toList();
    }

    public GameCatalogResponse getGame(Long id) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Game not found with ID: " + id));
        return mapGame(game);
    }

    private GameCatalogResponse mapGame(Game g) {
        int count = tournamentRepository.findByNameContainingIgnoreCaseOrGameNameContainingIgnoreCase("", g.getName()).size();
        return new GameCatalogResponse(
                g.getId(),
                g.getName(),
                g.getDescription(),
                g.getIconUrl(),
                g.getStatus(),
                count
        );
    }
}
