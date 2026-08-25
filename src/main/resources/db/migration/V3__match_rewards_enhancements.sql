ALTER TABLE matches DROP CONSTRAINT IF EXISTS matches_status_check;
ALTER TABLE matches ADD CONSTRAINT matches_status_check CHECK (status IN ('SCHEDULED','LIVE','COMPLETED'));
ALTER TABLE matches ADD COLUMN player_one_score INT NULL;
ALTER TABLE matches ADD COLUMN player_two_score INT NULL;
ALTER TABLE matches ADD COLUMN round_number INT NOT NULL DEFAULT 1;

ALTER TABLE registrations DROP CONSTRAINT IF EXISTS registrations_status_check;
ALTER TABLE registrations ADD CONSTRAINT registrations_status_check CHECK (status IN ('REGISTERED','APPROVED','CANCELLED'));

ALTER TABLE player_profiles ADD COLUMN token_balance INT NOT NULL DEFAULT 0;

ALTER TABLE rewards ADD COLUMN tournament_id BIGINT NULL;
ALTER TABLE rewards ADD COLUMN transaction_id VARCHAR(36) NOT NULL DEFAULT '';
ALTER TABLE rewards ADD CONSTRAINT fk_reward_tournament FOREIGN KEY (tournament_id) REFERENCES tournaments(id) ON DELETE SET NULL;

ALTER TABLE tournaments ADD COLUMN champion_id BIGINT NULL;
ALTER TABLE tournaments ADD CONSTRAINT fk_tournament_champion FOREIGN KEY (champion_id) REFERENCES player_profiles(id);
