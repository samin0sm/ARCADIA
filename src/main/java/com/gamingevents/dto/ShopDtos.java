package com.gamingevents.dto;

import java.time.Instant;
import java.util.List;

public final class ShopDtos {
    private ShopDtos() {}

    public record ItemResponse(
            Long id,
            String title,
            String description,
            int price,
            String itemType,
            String iconUrl,
            boolean owned
    ) {}

    public record PurchaseResponse(
            String message,
            Long purchaseId,
            Long itemId,
            String itemTitle,
            int pricePaid,
            int remainingBalance,
            Instant purchasedAt
    ) {}

    public record InventoryResponse(
            int currentBalance,
            List<ItemResponse> items
    ) {}
}
