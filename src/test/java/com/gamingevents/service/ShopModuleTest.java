package com.gamingevents.service;

import com.gamingevents.dto.ShopDtos.*;
import com.gamingevents.entity.*;
import com.gamingevents.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ShopModuleTest {

    @Mock private ShopItemRepository items;
    @Mock private ShopPurchaseRepository purchases;
    @Mock private PlayerProfileRepository profiles;
    @Mock private UserRepository users;
    @Mock private RewardRepository rewards;

    @InjectMocks private ShopService shopService;

    private User playerUser;
    private PlayerProfile playerProfile;
    private ShopItem diamondBadge;

    @BeforeEach
    void setUp() {
        playerUser = new User();
        playerUser.setId(1L);
        playerUser.setName("Pro Player");
        playerUser.setEmail("player@test.com");
        playerUser.setRole(Role.PLAYER);
        playerUser.setEnabled(true);

        playerProfile = new PlayerProfile();
        playerProfile.setId(10L);
        playerProfile.setUser(playerUser);
        playerProfile.setUsername("pro_gamer");
        playerProfile.setTokenBalance(150);

        diamondBadge = new ShopItem();
        diamondBadge.setId(100L);
        diamondBadge.setTitle("Diamond Badge");
        diamondBadge.setDescription("Glowing crest");
        diamondBadge.setPrice(50);
        diamondBadge.setItemType("BADGE");
        diamondBadge.setActive(true);
    }

    @Test
    @DisplayName("List shop items returns items with ownership status")
    void testListItems() {
        when(items.findAllByActiveTrueOrderByPriceAsc()).thenReturn(List.of(diamondBadge));
        when(users.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
        when(profiles.findByUser(playerUser)).thenReturn(Optional.of(playerProfile));
        when(purchases.findByPlayerOrderByPurchasedAtDesc(playerProfile)).thenReturn(List.of());

        List<ItemResponse> result = shopService.listItems("player@test.com");
        assertThat(result).hasSize(1);
        assertThat(result.get(0).title()).isEqualTo("Diamond Badge");
        assertThat(result.get(0).price()).isEqualTo(50);
        assertThat(result.get(0).owned()).isFalse();
    }

    @Test
    @DisplayName("Successful purchase deducts tokens and creates purchase record")
    void testSuccessfulPurchase() {
        when(users.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
        when(profiles.findByUser(playerUser)).thenReturn(Optional.of(playerProfile));
        when(items.findById(100L)).thenReturn(Optional.of(diamondBadge));
        when(purchases.existsByPlayerAndItem(playerProfile, diamondBadge)).thenReturn(false);

        ShopPurchase savedPurchase = new ShopPurchase();
        savedPurchase.setId(1L);
        savedPurchase.setItem(diamondBadge);
        savedPurchase.setPlayer(playerProfile);
        savedPurchase.setPricePaid(50);
        when(purchases.save(any())).thenReturn(savedPurchase);

        PurchaseResponse res = shopService.purchase(100L, "player@test.com");

        assertThat(res.itemTitle()).isEqualTo("Diamond Badge");
        assertThat(res.remainingBalance()).isEqualTo(100); // 150 - 50 = 100
        verify(profiles).save(playerProfile);
        verify(purchases).save(any());
        verify(rewards).save(any());
    }

    @Test
    @DisplayName("Purchase rejected with 409 Conflict if tokens insufficient")
    void testInsufficientTokens() {
        playerProfile.setTokenBalance(20);
        when(users.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
        when(profiles.findByUser(playerUser)).thenReturn(Optional.of(playerProfile));
        when(items.findById(100L)).thenReturn(Optional.of(diamondBadge));
        when(purchases.existsByPlayerAndItem(playerProfile, diamondBadge)).thenReturn(false);

        assertThatThrownBy(() -> shopService.purchase(100L, "player@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Insufficient token balance");
    }

    @Test
    @DisplayName("Purchase rejected with 409 Conflict if item already owned")
    void testAlreadyOwned() {
        when(users.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
        when(profiles.findByUser(playerUser)).thenReturn(Optional.of(playerProfile));
        when(items.findById(100L)).thenReturn(Optional.of(diamondBadge));
        when(purchases.existsByPlayerAndItem(playerProfile, diamondBadge)).thenReturn(true);

        assertThatThrownBy(() -> shopService.purchase(100L, "player@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already own this item");
    }

    @Test
    @DisplayName("Purchase rejected with 404 Not Found if item does not exist")
    void testItemNotFound() {
        when(users.findByEmail("player@test.com")).thenReturn(Optional.of(playerUser));
        when(profiles.findByUser(playerUser)).thenReturn(Optional.of(playerProfile));
        when(items.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> shopService.purchase(999L, "player@test.com"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }
}
