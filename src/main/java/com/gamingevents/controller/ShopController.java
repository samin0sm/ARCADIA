package com.gamingevents.controller;

import com.gamingevents.dto.ShopDtos.*;
import com.gamingevents.service.ShopService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shop")
@Tag(name = "Rewards Shop", description = "Token redemption store and player inventory management")
public class ShopController {

    private final ShopService shop;

    public ShopController(ShopService shop) {
        this.shop = shop;
    }

    @GetMapping("/items")
    @Operation(summary = "List all active shop items and ownership status")
    public List<ItemResponse> listItems(Authentication auth) {
        return shop.listItems(auth != null ? auth.getName() : null);
    }

    @PostMapping("/purchase/{id}")
    @PreAuthorize("hasRole('PLAYER')")
    @Operation(summary = "Purchase item using player token balance")
    public PurchaseResponse purchase(@PathVariable Long id, Authentication auth) {
        return shop.purchase(id, auth.getName());
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasRole('PLAYER')")
    @Operation(summary = "Get authenticated player's unlocked inventory")
    public InventoryResponse inventory(Authentication auth) {
        return shop.getInventory(auth.getName());
    }
}
