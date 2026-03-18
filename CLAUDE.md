# Jestly — Instructions Claude Code

## Langue
Toujours répondre en français.

## Qualité rédactionnelle française (OBLIGATOIRE — BLOQUANT)
Tout texte français généré ou modifié DOIT respecter les accents et l'orthographe corrects.
C'est une règle BLOQUANTE. Aucune exception.

### Règles absolues
- Toujours : é, è, ê, à, â, ç, î, ô, ù, œ là où nécessaire
- Jamais de français dégradé (ex: "Parametres" → "Paramètres", "Apercu" → "Aperçu")
- Consulter `FRENCH_COPY_GUIDE.md` pour la terminologie et les règles complètes
- Vérifier chaque string visible avant de la produire

### Template de génération (à appliquer systématiquement)
Quand tu génères du texte français (labels, CTAs, placeholders, messages, titres, descriptions) :
1. Écrire le texte avec TOUS les accents corrects dès la première version
2. Relire chaque string pour vérifier : é/è/ê, à/â, ç, î/ô, ù
3. Utiliser `src/lib/ui-labels.ts` (import `L`) pour les labels standards réutilisés
4. Ne JAMAIS écrire un mot français sans ses accents, même dans un commentaire

### Erreurs les plus fréquentes à éviter
Parametres→Paramètres, Apercu→Aperçu, Creer→Créer, tache→tâche, Evenement→Événement,
Resultat→Résultat, Categorie→Catégorie, Telecharger→Télécharger, Echeance→Échéance,
Equipe→Équipe, Activite→Activité, Identite→Identité, Pret→Prêt, modele→modèle,
Temoignage→Témoignage, Realisation→Réalisation, Developpement→Développement

### Outils disponibles
- `src/lib/french-guard.ts` — `ensureFrench()`, `checkFrench()`, `useFrenchGuard()`
- `src/lib/ui-labels.ts` — `L.settings`, `L.create`, `L.task`, etc.
- `bash scripts/french-lint.sh` — lint avant commit
- `bash scripts/french-lint.sh --strict` — mode CI bloquant

## Gui — Agent de test
Quand l'utilisateur dit "Gui", "lance Gui", "appelle Gui", ou "/gui", lancer l'agent de test :

1. Exécuter `bash scripts/gui-test.sh` pour les tests DB/API
2. Puis lancer un agent en background qui teste aussi la résolution publique via curl sur `https://jestly.fr/s/rasenyax` et vérifie que le HTML contient du contenu (pas "Site introuvable" ni "Page introuvable")
3. Rapporter les résultats à l'utilisateur

## Stack
- Next.js 16 App Router + TypeScript + Tailwind + Supabase
- Supabase: type bypass avec `(supabase.from("table") as any)`
- Deploy: Vercel (git push origin main)
