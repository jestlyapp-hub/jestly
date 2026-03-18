# Guide de qualité rédactionnelle — Jestly (Français)

> Ce document est la référence absolue pour tout texte visible dans le produit Jestly.
> Tout contributeur (humain ou IA) doit le respecter avant de merger du contenu.

---

## 1. Règle fondamentale

**Tout texte français dans Jestly doit utiliser les accents et caractères corrects.**

Jamais de français dégradé. Jamais de texte sans accents "par commodité".
Le produit est destiné à des francophones natifs. La qualité rédactionnelle est non-négociable.

---

## 2. Accents et caractères obligatoires

| Caractère | Exemples corrects |
|-----------|-------------------|
| é | Créer, Résumé, Paramètres, Activité, Sélectionner |
| è | Modèle, Première, Critère, Dernière |
| ê | Prêt, Être, Fenêtre |
| à | À partir de, Déjà, Paramètre |
| â | Tâche, Âge |
| ù | Où |
| ç | Aperçu, Reçu, Façon, Commençons |
| œ | Œuvre (rare en UI) |
| î | Connaître, Apparaître, Maître |
| ô | Contrôle, Rôle, Côté |

---

## 3. Erreurs interdites (liste non exhaustive)

| Interdit | Correct |
|----------|---------|
| Parametres | Paramètres |
| Apercu | Aperçu |
| Creer | Créer |
| Telecharger | Télécharger |
| Resume | Résumé |
| Resultat | Résultat |
| deja | déjà |
| Pret | Prêt |
| tache | tâche |
| modele | modèle |
| personnalise | personnalisé |
| verifie | vérifié |
| Facture payee | Facture payée |
| mise a jour | mise à jour |
| a partir de | à partir de |
| etat | état |
| connecte | connecté |
| identite | identité |
| activite | activité |
| securite | sécurité |
| selectionner | sélectionner |
| categorie | catégorie |
| derniere | dernière |
| premiere | première |
| numero | numéro |
| reponse | réponse |
| controle | contrôle |
| role | rôle |
| equipe | équipe |
| cote | côté |
| ameliorer | améliorer |
| reussite | réussite |
| generer | générer |
| evenement | événement |
| echeance | échéance |

---

## 4. Ponctuation française

- Espace insécable avant `:`, `;`, `!`, `?` (en HTML : `\u00A0` ou `&nbsp;`)
- Guillemets français : « » (avec espaces insécables intérieures)
- Apostrophe typographique : `'` (U+2019) préférée à `'` (ASCII), mais `'` est toléré en code
- Pas de double espace après un point

---

## 5. Terminologie standardisée

| Terme officiel Jestly | Alternatives interdites |
|-----------------------|------------------------|
| Paramètres | Réglages (sauf sous-menu) |
| Commandes | Orders |
| Clients | Contacts (sauf contexte CRM spécifique) |
| Aperçu | Prévisualisation (sauf contexte technique) |
| Publier | Mettre en ligne |
| Site web | Site internet |
| Tableau de bord | Dashboard (sauf en-tête technique) |
| Prospects | Leads (sauf contexte API) |
| Brief client | Demande, Brief |
| Facturation | Billing |
| Commencer gratuitement | CTA principal |
| Voir la démo | CTA secondaire |
| Sans engagement | Aucun engagement |
| Prêt en 2 minutes | CTA de réassurance |

---

## 6. Ton et style

- **Ton** : professionnel, accessible, premium, confiant
- **Voix** : tutoiement interdit sauf contexte marketing très ciblé
- **Concision** : labels courts, pas de verbosité inutile
- **Majuscules** : Première lettre majuscule seulement (pas de Title Case anglais)
  - Correct : "Créer un client"
  - Incorrect : "Créer Un Client"
- **Infinitif** pour les boutons d'action : "Créer", "Modifier", "Supprimer"
- **Participe passé** pour les états : "Créé", "Modifié", "Supprimé"

---

## 7. Checklist avant merge

- [ ] Tous les accents français sont corrects
- [ ] Pas de texte en anglais non justifié
- [ ] Ponctuation française respectée
- [ ] Terminologie conforme au guide
- [ ] Ton cohérent avec le reste du produit
- [ ] Labels testés sur mobile (pas trop longs)
- [ ] Placeholders et messages d'erreur vérifiés
- [ ] Métadonnées SEO (title, description) vérifiées

---

## 8. Règle pour la génération IA

Si du contenu est généré par IA (Claude, GPT, etc.) :

> **Prompt obligatoire** : "Tout le texte doit être en français natif avec tous les accents corrects (é, è, ê, à, â, ç, î, ô, ù, œ). Jamais de français dégradé ou sans accents. Ton premium, professionnel, naturel."

Ne jamais accepter de texte généré sans vérification manuelle des accents.

---

## 9. Outils de protection

### Script de détection (lint)
```bash
bash scripts/french-lint.sh           # mode avertissement
bash scripts/french-lint.sh --strict  # mode CI (bloque si erreurs)
```

### Runtime checker (dev uniquement)
```tsx
import { ensureFrench, checkFrench, useFrenchGuard } from "@/lib/french-guard";

// Vérifier un texte — log un warning si problème
const label = ensureFrench("Parametres"); // ⚠ warn + retourne "Paramètres"

// Vérifier des labels dans un composant
useFrenchGuard({ title: myTitle, cta: ctaLabel }, "MyComponent");
```

### Labels centralisés
```tsx
import { L } from "@/lib/ui-labels";

<button>{L.create}</button>       // "Créer"
<h1>{L.settings}</h1>            // "Paramètres"
<span>{L.readyIn2Min}</span>     // "Prêt en 2 minutes"
```

### Fichiers clés
| Fichier | Rôle |
|---------|------|
| `FRENCH_COPY_GUIDE.md` | Guide de style complet |
| `src/lib/french-guard.ts` | Runtime checker + autocorrect map |
| `src/lib/ui-labels.ts` | Labels centralisés (`L.xxx`) |
| `scripts/french-lint.sh` | Lint build-time avec whitelist |
| `CLAUDE.md` | Règles IA bloquantes |
