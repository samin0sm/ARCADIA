ALTER TABLE matches MODIFY status ENUM('SCHEDULED','LIVE','COMPLETED') NOT NULL DEFAULT 'SCHEDULED';
ALTER TABLE matches ADD COLUMN player_one_score INT NULL;
ALTER TABLE matches ADD COLUMN player_two_score INT NULL;
ALTER TABLE matches ADD COLUMN round_number INT NOT NULL DEFAULT 1;

ALTER TABLE registrations MODIFY status ENUM('REGISTERED','APPROVED','CANCELLED') NOT NULL DEFAULT 'REGISTERED';

ALTER TABLE player_profiles ADD COLUMN token_balance INT NOT NULL DEFAULT 0;

ALTER TABLE rewards ADD COLUMN tournament_id BIGINT NULL;
ALTER TABLE rewards ADD COLUMN transaction_id VARCHAR(36) NOT NULL DEFAULT '';
ALTER TABLE rewards ADD CONSTRAINT fk_reward_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL;

ALTER TABLE tournaments ADD COLUMN champion_id BIGINT NULL;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournament_champion FOREIGN KEY (champion_id) REFERENCES player_profiles(id);
