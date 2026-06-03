# Blockers · Jestly Ecommerce V3

Éléments nécessitant une action externe (clé API, compte tiers, accès) avant de
pouvoir être codés ou testés de bout en bout.

| Item | Phase | Nature du blocage | Décision |
|---|---|---|---|
| Dev token Google Ads | 2 | Token en attente de validation Google | Connecteur Google Ads reporté. Schéma et OAuth réutilisables (lib/oauth/google.ts existe). |
| Comptes observabilité (Posthog, Inngest, Upstash) | 0 | Comptes/clés non provisionnés | Setup différé. Sentry + Resend déjà en dépendances. |
| Clé Anthropic (`ANTHROPIC_API_KEY`) | 10 | À confirmer dans .env.local | Logique d'anomalies (pure) déjà livrée et testée. Seule la rédaction du brief dépend de la clé. |
| Domaine `pixel.jestly.fr` | 5 | DNS / déploiement Edge à configurer | Pixel reporté. Schéma `pixel_events` (088) prêt. |

## Convention
Quand un blocage est levé, déplacer la ligne ici vers `CHANGELOG.md` avec la date
de déblocage et reprendre la phase correspondante.
