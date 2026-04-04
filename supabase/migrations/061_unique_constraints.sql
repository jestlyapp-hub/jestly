-- 061: Contraintes d'unicité sur profiles pour éviter les doublons
-- Utilise CREATE UNIQUE INDEX pour gérer les données existantes proprement

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email_unique
  ON profiles(email)
  WHERE email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_customer_unique
  ON profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_unique
  ON profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;
