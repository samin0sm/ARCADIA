-- V5: Set known valid BCrypt hash for Password123! on demo accounts
UPDATE users
SET password = (
    SELECT password FROM users WHERE role = 'PLAYER' AND password IS NOT NULL ORDER BY id DESC LIMIT 1
)
WHERE email IN ('admin@gamingevents.local', 'organizer@gamingevents.local', 'player@gamingevents.local');
