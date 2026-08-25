package com.gamingevents.repository;

import com.gamingevents.entity.PlayerProfile;
import com.gamingevents.entity.ShopItem;
import com.gamingevents.entity.ShopPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ShopPurchaseRepository extends JpaRepository<ShopPurchase, Long> {
    List<ShopPurchase> findByPlayerOrderByPurchasedAtDesc(PlayerProfile player);
    Optional<ShopPurchase> findByPlayerAndItem(PlayerProfile player, ShopItem item);
    boolean existsByPlayerAndItem(PlayerProfile player, ShopItem item);
}
