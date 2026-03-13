-- ============================================================
-- 040 — User Settings & Workspace Configuration
-- ============================================================
-- Ajoute les colonnes de configuration utilisateur et workspace
-- sur la table profiles (JSONB extensible).

-- ── User preferences (locale, timezone, UI prefs) ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS settings JSONB NOT NULL DEFAULT '{}';

-- ── Workspace / business identity ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS workspace JSONB NOT NULL DEFAULT '{}';

-- ── Notification preferences ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS notifications JSONB NOT NULL DEFAULT '{}';

-- ── Extra profile fields ──
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'fr',
  ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris';

COMMENT ON COLUMN profiles.settings IS 'User preferences: {defaultPage, compactMode, amountDisplay, defaultCurrency, calendarView, ...}';
COMMENT ON COLUMN profiles.workspace IS 'Business identity: {companyName, logo, website, phone, email, address, country, vatNumber, siret, defaultCurrency, defaultTaxRate, paymentTermsDays, invoicePrefix, ...}';
COMMENT ON COLUMN profiles.notifications IS 'Notification prefs: {email: {...}, inApp: {...}, digest: {...}}';
