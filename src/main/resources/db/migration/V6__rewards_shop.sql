-- V6: Rewards Shop and Player Inventory
CREATE TABLE IF NOT EXISTS shop_items (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    price INT NOT NULL CHECK (price >= 0),
    item_type VARCHAR(50) NOT NULL,
    icon_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS shop_purchases (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES player_profiles(id) ON DELETE CASCADE,
    item_id BIGINT NOT NULL REFERENCES shop_items(id) ON DELETE CASCADE,
    price_paid INT NOT NULL,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_player_item UNIQUE (player_id, item_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_items_active ON shop_items(is_active);
CREATE INDEX IF NOT EXISTS idx_shop_purchases_player ON shop_purchases(player_id);

-- Seed Shop Items
INSERT INTO shop_items (title, description, price, item_type, icon_url, is_active) VALUES
('Diamond Champion Badge', 'Exclusive glowing diamond crest displayed next to your gamer tag.', 50, 'BADGE', '💎', TRUE),
('Cyber Neon Avatar Frame', 'Futuristic cyberpunk neon animated border for your profile avatar.', 75, 'AVATAR_FRAME', '⚡', TRUE),
('Golden Victory Banner', 'Gilded champion victory banner for tournament lobbies.', 100, 'BANNER', '🏆', TRUE),
('Pro League VIP Pass', 'VIP priority access and distinct leaderboard flare.', 150, 'PASS', '🎟️', TRUE),
('Mythic Dragon Title', 'Unlocks the prestigious "Mythic Dragon" title on player cards.', 200, 'TITLE', '🐉', TRUE)
ON CONFLICT DO NOTHING;
