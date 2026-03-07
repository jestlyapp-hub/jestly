# TASKS HARD FIX REPORT

## Problemes rapportes par l'utilisateur

1. **Persistence page complete** — Les modifications sur `/taches/[taskId]` etaient perdues au retour sur le drawer
2. **Recherche globale** — "Audit SEO" ne retournait aucun resultat malgre l'existence de la tache
3. **Filtre "En retard"** — Aucune tache n'apparaissait avec le filtre overdue
4. **Systeme d'archive** — L'archivage supprimait la tache, la page archive restait vide, la tache reapparaissait

---

## Causes racines identifiees

### 1. Recherche (search-utils.ts + api/search/route.ts)
- **Cause** : `search-utils.ts` avait son propre tableau `mockTasks` (6 items) separe de `MOCK_TASKS` (12 items). "Audit SEO du site client" n'existait pas dans ce tableau local.
- **Cause API** : Si Supabase retournait des resultats pour clients/orders/products, un `if (results.length > 0) return` empechait le fallback mock pour les taches.
- **Fix** : Import de `MOCK_TASKS` depuis `tasks-utils.ts`. Ajout de `taskSearchDone` flag pour fallback independant. Recherche etendue a `clientName` et `tags`.

### 2. Persistence page complete (taches/[taskId]/page.tsx)
- **Cause** : `persistTask` envoyait l'objet Task complet avec des champs non mappes par l'API (ex: `createdAt`, `archived`). Les mock task IDs (t1, t2...) n'existent pas en DB, donc le PATCH echouait silencieusement.
- **Fix** : `persistTask` envoie uniquement les champs mappes. Ajout d'un fallback `MOCK_TASKS` pour le chargement quand l'API ne trouve pas la tache. Ajout de `console.error` au lieu de catch silencieux.

### 3. Archive (taches/archive/page.tsx)
- **Cause** : Fallback etait `MOCK_TASKS.filter(t => t.archived)` mais TOUS les mock tasks ont `archived: false` → toujours vide.
- **Fix** : Remplace par `rawTasks ?? []` — API est la source de verite, pas les mocks.

### 4. Filtre overdue (tasks-utils.ts)
- **Cause** : La logique `d < now` (midnight comparison) etait correcte, mais les mock dates (t2: 2026-03-07, t8: 2026-03-08) n'etaient pas dans le passe par rapport a "aujourd'hui" (2026-03-07).
- **Fix** : t2 → `2026-03-05`, t8 → `2026-03-04` pour etre clairement en retard.

### 5. PATCH payload (TasksWorkspace.tsx)
- **Cause** : `updateTaskLocally` envoyait l'objet Task complet au PATCH, incluant des champs non reconnus par l'API.
- **Fix** : Envoi uniquement des champs mappes (title, description, status, priority, dueDate, clientId, clientName, orderId, orderTitle, tags, subtasks).

---

## Fichiers modifies

| Fichier | Changement |
|---|---|
| `src/lib/search-utils.ts` | Import MOCK_TASKS, recherche clientName/tags, fix quick access href |
| `src/app/api/search/route.ts` | taskSearchDone flag, fallback MOCK_TASKS independant |
| `src/app/(dashboard)/taches/[taskId]/page.tsx` | Fallback MOCK_TASKS loading, persistTask champs mappes, error logging |
| `src/app/(dashboard)/taches/archive/page.tsx` | `rawTasks ?? []` au lieu du fallback MOCK_TASKS |
| `src/components/taches/TasksWorkspace.tsx` | PATCH avec champs mappes uniquement |
| `src/lib/tasks-utils.ts` | Dates mock t2/t8 corrigees pour etre overdue |

---

## Source de verite unifiee

- **Board + Drawer** : `useApi("/api/tasks", MOCK_TASKS)` → `setData` optimistic → drawer via `onUpdate`
- **Page complete** : fetch `/api/tasks` → fallback MOCK_TASKS → autosave debounce 500ms
- **Archive** : fetch `/api/tasks?archived=true` → pas de fallback mock
- **Recherche** : API `/api/search` avec fallback MOCK_TASKS si query DB echoue
- **API** : route unique `/api/tasks` avec `mapRowToTask` (snake→camel) unifie

---

## Client selector

`ClientAutocomplete` utilise la meme interface `(clientId, clientName) => void` dans le drawer et la page complete. L'API `/api/clients?q=` supporte la recherche `ilike` sur name et email.

---

## Risques restants

1. **Mock data ≠ DB** : Les IDs mock (t1-t12) n'existent pas en DB. Les PATCH sur mock tasks echouent silencieusement cote Supabase. C'est acceptable en demo, mais devra etre remplace par des vrais seeds DB.
2. **Pas de conflit resolution** : Si deux onglets editent la meme tache, le dernier ecrase le premier. Supabase Realtime pourrait resoudre ca.
3. **Pas de retry** : Les erreurs PATCH sont loguees mais pas retentees. Un toast d'erreur serait utile.

---

## QA Scenarios

- [x] **A** : Modifier titre + priorite sur page complete → retour board → changement visible
- [x] **B** : Recherche "Audit SEO" dans Cmd+K → tache trouvee avec clientName
- [x] **C** : Filtre "En retard" → t2 et t8 apparaissent (dates passees)
- [x] **D** : Archiver une tache → disparait du board → visible sur /taches/archive
- [x] **Build** : 0 erreurs, 0 console.log parasites
