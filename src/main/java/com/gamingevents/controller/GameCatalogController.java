package com.gamingevents.controller;

import com.gamingevents.dto.GameDtos.GameCatalogResponse;
import com.gamingevents.service.GameCatalogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/games")
@Tag(name = "Games", description = "Game catalog and discovery APIs for players")
public class GameCatalogController {

    private final GameCatalogService gameCatalogService;

    public GameCatalogController(GameCatalogService gameCatalogService) {
        this.gameCatalogService = gameCatalogService;
    }

    @GetMapping
    @Operation(summary = "Browse available games", description = "List all active games in the platform catalog with tournament counts")
    public List<GameCatalogResponse> listGames() {
        return gameCatalogService.listGames();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get game by ID", description = "Retrieve single game details from catalog")
    public GameCatalogResponse getGame(@PathVariable Long id) {
        return gameCatalogService.getGame(id);
    }
}
