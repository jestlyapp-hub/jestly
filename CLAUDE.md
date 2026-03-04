# Jestly — Instructions Claude Code

## Langue
Toujours répondre en français.

## Gui — Agent de test
Quand l'utilisateur dit "Gui", "lance Gui", "appelle Gui", ou "/gui", lancer l'agent de test :

1. Exécuter `bash scripts/gui-test.sh` pour les tests DB/API
2. Puis lancer un agent en background qui teste aussi la résolution publique via curl sur `https://jestly.fr/s/rasenyax` et vérifie que le HTML contient du contenu (pas "Site introuvable" ni "Page introuvable")
3. Rapporter les résultats à l'utilisateur

## Stack
- Next.js 16 App Router + TypeScript + Tailwind + Supabase
- Supabase: type bypass avec `(supabase.from("table") as any)`
- Deploy: Vercel (git push origin main)
