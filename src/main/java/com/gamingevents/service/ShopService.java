package com.gamingevents.service;

import com.gamingevents.dto.ShopDtos.*;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.*;

@Service
public class ShopService {

    private final ShopItemRepository items;
    private final ShopPurchaseRepository purchases;
    private final PlayerProfileRepository profiles;
    private final UserRepository users;
    private final RewardRepository rewards;

    public ShopService(
            ShopItemRepository items,
            ShopPurchaseRepository purchases,
            PlayerProfileRepository profiles,
            UserRepository users,
            RewardRepository rewards
    ) {
        this.items = items;
        this.purchases = purchases;
        this.profiles = profiles;
        this.users = users;
        this.rewards = rewards;
    }

    public List<ItemResponse> listItems(String email) {
        List<ShopItem> all = items.findAllByActiveTrueOrderByPriceAsc();
        PlayerProfile profile = getPlayerProfile(email);
        Set<Long> ownedIds = new HashSet<>();

        if (profile != null) {
            purchases.findByPlayerOrderByPurchasedAtDesc(profile)
                    .forEach(p -> ownedIds.add(p.getItem().getId()));
        }

        return all.stream()
                .map(i -> new ItemResponse(
                        i.getId(),
                        i.getTitle(),
                        i.getDescription(),
                        i.getPrice(),
                        i.getItemType(),
                        i.getIconUrl(),
                        ownedIds.contains(i.getId())
                ))
                .toList();
    }

    @Transactional
    public PurchaseResponse purchase(Long itemId, String email) {
        PlayerProfile profile = getPlayerProfile(email);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only players can purchase from the rewards shop");
        }

        ShopItem item = items.findById(itemId)
                .filter(ShopItem::isActive)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Shop item not found with ID: " + itemId));

        if (purchases.existsByPlayerAndItem(profile, item)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You already own this item");
        }

        if (profile.getTokenBalance() < item.getPrice()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Insufficient token balance (" + profile.getTokenBalance() + " / " + item.getPrice() + " required)"
            );
        }

        // Deduct tokens
        profile.addTokens(-item.getPrice());
        profiles.save(profile);

        // Record Purchase
        ShopPurchase purchase = new ShopPurchase();
        purchase.setPlayer(profile);
        purchase.setItem(item);
        purchase.setPricePaid(item.getPrice());
        ShopPurchase saved = purchases.save(purchase);

        // Record Ledger Entry
        Reward ledger = new Reward();
        ledger.setPlayer(profile);
        ledger.setAmount(-item.getPrice());
        ledger.setRewardType("SHOP_PURCHASE");
        ledger.setTransactionId(UUID.randomUUID().toString());
        rewards.save(ledger);

        return new PurchaseResponse(
                "Successfully purchased " + item.getTitle() + "!",
                saved.getId(),
                item.getId(),
                item.getTitle(),
                item.getPrice(),
                profile.getTokenBalance(),
                saved.getPurchasedAt()
        );
    }

    public InventoryResponse getInventory(String email) {
        PlayerProfile profile = getPlayerProfile(email);
        if (profile == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only players can view inventory");
        }

        List<ItemResponse> owned = purchases.findByPlayerOrderByPurchasedAtDesc(profile).stream()
                .map(p -> new ItemResponse(
                        p.getItem().getId(),
                        p.getItem().getTitle(),
                        p.getItem().getDescription(),
                        p.getPricePaid(),
                        p.getItem().getItemType(),
                        p.getItem().getIconUrl(),
                        true
                ))
                .toList();

        return new InventoryResponse(profile.getTokenBalance(), owned);
    }

    private PlayerProfile getPlayerProfile(String email) {
        if (email == null) return null;
        return users.findByEmail(email.toLowerCase())
                .filter(u -> u.getRole() == Role.PLAYER)
                .flatMap(profiles::findByUser)
                .orElse(null);
    }
}
