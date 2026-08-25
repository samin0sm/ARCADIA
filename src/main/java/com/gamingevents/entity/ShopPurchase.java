package com.gamingevents.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "shop_purchases", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"player_id", "item_id"})
})
public class ShopPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "player_id")
    private PlayerProfile player;

    @ManyToOne(optional = false)
    @JoinColumn(name = "item_id")
    private ShopItem item;

    @Column(name = "price_paid", nullable = false)
    private int pricePaid;

    @Column(name = "purchased_at", updatable = false)
    private Instant purchasedAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public PlayerProfile getPlayer() { return player; }
    public void setPlayer(PlayerProfile player) { this.player = player; }

    public ShopItem getItem() { return item; }
    public void setItem(ShopItem item) { this.item = item; }

    public int getPricePaid() { return pricePaid; }
    public void setPricePaid(int pricePaid) { this.pricePaid = pricePaid; }

    public Instant getPurchasedAt() { return purchasedAt; }
    public void setPurchasedAt(Instant purchasedAt) { this.purchasedAt = purchasedAt; }
}
