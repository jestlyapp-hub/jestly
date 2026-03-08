# Leads CRM Sprint — Report

## Lead Sources Audited

| Surface | Type | Avant | Après |
|---------|------|-------|-------|
| contact-form | Formulaire avec champs configurables | Actif → table leads | Actif + attribution enrichie |
| custom-form | Formulaire custom | Actif → table leads | Actif + attribution enrichie |
| form-contact-simple | Bloc formulaire simple | **UI statique** | **Connecté** → pipeline leads |
| form-quote-request | Bloc demande de devis | **UI statique** | **Connecté** → pipeline leads |
| form-newsletter-lead | Bloc newsletter premium | **UI statique** | **Connecté** → pipeline leads |
| newsletter | Bloc newsletter simple | **UI statique** | **Connecté** → pipeline leads |
| lead-magnet | Bloc lead magnet | **UI statique** | **Connecté** → pipeline leads |
| checkout | Flux checkout / paiement | Créait orders + clients, **pas de lead** | **Crée aussi un lead** automatiquement |
| calendar-booking | Bloc réservation | Délégué à Calendly/Cal.com | Non connecté (externe) |

**Résultat** : 8 surfaces connectées sur 9. Seul `calendar-booking` reste externe (Calendly/Cal.com gère ses propres leads).

## Unified Data Model

Colonnes ajoutées à la table `leads` (migration 025) :

| Colonne | Type | Description |
|---------|------|-------------|
| company | TEXT | Entreprise du lead |
| status | TEXT (default 'new') | new / contacted / qualified / won / lost / archived |
| page_path | TEXT | Page d'origine |
| block_type | TEXT | Type de bloc source |
| block_label | TEXT | Label du bloc source |
| utm_source | TEXT | UTM source |
| utm_medium | TEXT | UTM medium |
| utm_campaign | TEXT | UTM campaign |
| referrer | TEXT | Referrer HTTP |
| product_name | TEXT | Produit/service associé |
| amount | NUMERIC | Montant si checkout |
| notes | TEXT | Notes internes CRM |

Index ajoutés : `idx_leads_status`, `idx_leads_source`

## Page Redesign Summary

La page `/site-web/[siteId]/leads` est passée d'un simple tableau 4 colonnes à un CRM dashboard complet :

### KPI Strip (5 cartes)
- Total leads
- Cette semaine
- Nouveaux (à traiter)
- Qualifiés (prêts à convertir)
- Convertis (clients gagnés + montant total)

### Source Breakdown Bar
- Affiche toutes les sources actives avec compteur
- Clic pour filtrer par source

### Filtres et Recherche
- Filtres par statut : Tous / Nouveau / Contacté / Qualifié / Converti / Perdu / Archivé
- Compteurs par statut sur chaque filtre
- Recherche par nom, email, entreprise, téléphone

### Table enrichie
- Avatar coloré selon la source
- Nom + email
- Badge source (coloré)
- Badge statut (coloré)
- Page d'origine
- Date

### Detail Drawer (SlidePanel)
- **Carte identité** : nom, email, téléphone, entreprise, avatar
- **Sélecteur de statut** : workflow complet cliquable
- **Attribution** : source, date, page, bloc, campagne UTM, referrer
- **Contexte commercial** : produit/service, montant
- **Message** : texte libre affiché
- **Données soumises** : tous les champs du formulaire
- **Notes internes** : textarea avec sauvegarde
- **Actions** : email, appel téléphonique

### Empty State
- Icône premium
- Explication des sources de leads
- Tags visuels des types de capture

## API Changes

### POST /api/public/leads (enrichi)
Nouveaux champs acceptés : company, page_path, block_type, block_label, utm_source, utm_medium, utm_campaign, referrer, product_name, amount

### PATCH /api/leads (nouveau)
Permet la mise à jour du statut et des notes d'un lead. Vérifie l'ownership via les sites de l'utilisateur.

### POST /api/public/checkout (enrichi)
Crée désormais automatiquement un lead avec source "checkout" en plus de l'order et du client.

## Files Created
- `src/lib/lead-capture.ts` — Helper partagé de capture de leads
- `supabase/migrations/025_leads_crm_upgrade.sql` — Migration enrichissement table leads
- `LEADS_CRM_REPORT.md` — Ce rapport

## Files Modified
- `src/types/index.ts` — Lead type enrichi (LeadSource, LeadStatus, 17+ champs)
- `src/app/api/public/leads/route.ts` — Pipeline d'ingestion enrichi
- `src/app/api/leads/route.ts` — Ajout PATCH pour statut/notes
- `src/app/api/public/checkout/route.ts` — Ajout création de lead
- `src/app/(dashboard)/site-web/[siteId]/leads/page.tsx` — CRM dashboard complet
- `src/components/site-public/SitePublicRenderer.tsx` — Passage contexte lead aux blocs
- `src/components/site-web/blocks/FormContactSimpleBlockPreview.tsx` — Formulaire actif
- `src/components/site-web/blocks/FormQuoteRequestBlockPreview.tsx` — Formulaire actif
- `src/components/site-web/blocks/FormNewsletterLeadBlockPreview.tsx` — Formulaire actif
- `src/components/site-web/blocks/NewsletterBlockPreview.tsx` — Formulaire actif
- `src/components/site-web/blocks/LeadMagnetBlockPreview.tsx` — Formulaire actif
- `src/lib/mock-data.ts` — Mock leads mis à jour

## QA Scenarios

| Scenario | Résultat |
|----------|----------|
| A — Contact form lead | Pipeline connecté, source=contact-form, champs préservés |
| B — Quote request lead | Pipeline connecté via form-quote-request, source=quote-request |
| C — Newsletter lead | Pipeline connecté via newsletter + form-newsletter-lead, source=newsletter |
| D — Checkout lead | Ajouté dans POST /api/public/checkout, source=checkout, amount préservé |
| E — Status workflow | PATCH /api/leads, UI sélecteur statut dans drawer, mutate après changement |
| F — Filters/Search | Filtres statut + source + recherche texte libre vérifiés |
| G — Page/block attribution | Context passé via SitePublicRenderer → leadCtx → page_path + block_type |
| Build | `next build` passe sans erreur |
| TypeScript | `tsc --noEmit` passe sans erreur |

## Future CRM Opportunities

1. **Export CSV** — Exporter les leads filtrés
2. **Timeline d'activité** — Historique des changements de statut
3. **Scoring automatique** — Score de qualité basé sur la source et les données
4. **Email intégré** — Envoyer des emails directement depuis le CRM
5. **Tags/Labels** — Catégorisation libre des leads
6. **Webhook notifications** — Alertes sur nouveaux leads
7. **Analytics page-level** — Quelle page convertit le mieux
8. **Duplicate detection** — Déduplication par email
9. **Calendar-booking integration** — Webhook Calendly pour capturer les réservations
10. **Bulk actions** — Changer le statut de plusieurs leads en un clic
