-- Lägg till push_token-kolumn till profiles-tabellen
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS push_token TEXT; 