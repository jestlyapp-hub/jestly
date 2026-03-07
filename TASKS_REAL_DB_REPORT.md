# Task System Real DB Hard Fix Report

**Date**: 2026-03-07
**Sprint**: Final Real DB Hard Fix
**Status**: COMPLETE

---

## 1. Architecture apres fix

Toutes les surfaces du systeme de taches utilisent desormais exclusivement la DB Supabase comme source de verite :

| Surface | Source de donnees | Endpoint |
|---------|-------------------|----------|
| Board Kanban | `useApi("/api/tasks")` | GET /api/tasks |
| Drawer | Donnees du board (meme state) | — |
| Page complete | `fetch("/api/tasks")` + find by ID | GET /api/tasks |
| Page archive | `useApi("/api/tasks?archived=true")` | GET /api/tasks?archived=true |
| Recherche globale | `/api/search` → Supabase query | GET /api/search?q= |
| Client selector | `/api/clients?q=` | GET /api/clients |
| Filtres (overdue, urgent, week) | Calcul client-side sur donnees DB | — |

### Schema DB utilise

Table `tasks` avec colonnes :
- `id` (UUID, PK)
- `user_id` (UUID, FK)
- `title`, `description` (text)
- `status` (text: todo, in_progress, done, completed)
- `priority` (text: low, medium, high, urgent)
- `due_date` (date, nullable)
- `client_id`, `client_name` (text, nullable)
- `order_id`, `order_title` (text, nullable)
- `tags` (jsonb, array)
- `subtasks` (jsonb, array of {id, text, done})
- `archived_at` (timestamp, nullable — null = actif, non-null = archive)
- `created_at`, `updated_at` (timestamp)

---

## 2. Mock usage avant le fix

### Ce qui existait :
- `MOCK_TASKS` : tableau de 12 taches fictives (IDs t1-t12) dans `tasks-utils.ts`
- `searchMockData()` dans `search-utils.ts` : parcourait MOCK_TASKS pour la recherche
- `getQuickAccessItems()` : renvoyait des items hardcodes avec des IDs mock (t1, etc.)
- API POST `/api/tasks` : retournait un faux succes avec ID aleatoire quand l'INSERT Supabase echouait
- API PATCH `/api/tasks` : retournait les donnees d'entree comme si la mise a jour avait reussi quand l'UPDATE echouait

### Impact :
- La recherche pouvait retourner des taches inexistantes en DB
- Le quick-access pointait vers des taches `/taches/t1` qui n'existent pas en DB
- La creation de tache pouvait sembler reussir alors que rien n'etait persiste
- La modification de tache pouvait sembler reussir alors que la DB n'etait pas mise a jour

---

## 3. Ce qui a ete supprime / corrige

| Fichier | Changement |
|---------|------------|
| `src/lib/tasks-utils.ts` | Suppression complete de `MOCK_TASKS` (190 lignes) |
| `src/lib/search-utils.ts` | Suppression de `searchMockData()`, suppression de l'import `MOCK_TASKS`, suppression de l'import `mock-data` |
| `src/lib/search-utils.ts` | `getQuickAccessItems()` remplace par des raccourcis de navigation generiques |
| `src/app/api/tasks/route.ts` | POST retourne HTTP 500 au lieu d'un faux succes quand INSERT echoue |
| `src/app/api/tasks/route.ts` | PATCH retourne HTTP 500 au lieu des donnees d'entree quand UPDATE echoue |
| `src/app/api/tasks/route.ts` | Suppression de `mapRecordToTask` (code mort) |
| `src/app/api/search/route.ts` | Ajout de `description.ilike` pour une recherche plus large |
| `src/components/taches/TasksWorkspace.tsx` | Rollback optimiste si POST echoue, remplacement ID temporaire par ID DB |

---

## 4. Root causes identifies

1. **Faux succes API** : Le pattern le plus dangereux. L'API retournait un objet qui ressemble a une tache valide meme quand Supabase echouait. Le client ne savait jamais que la persistence avait echoue.

2. **searchMockData comme fallback** : Bien que `GlobalSearch` utilisait deja `/api/search` (DB-backed), la fonction `searchMockData()` existait encore et importait `MOCK_TASKS`, creant un couplage inutile.

3. **IDs mock vs DB** : Les IDs mock (t1-t12) sont des strings courtes. Les IDs DB sont des UUIDs. Si une tache mock etait affichee et que l'utilisateur tentait de la PATCH, la requete Supabase echouait silencieusement (pas de row matchee).

4. **Quick-access hardcode** : Pointait vers `/taches/t1` qui n'existe en DB que si par hasard un UUID commence par "t1" (impossible).

---

## 5. Validation par surface

### Board Kanban
- Source : `useApi("/api/tasks")` sans fallback mock
- Les taches affichees viennent exclusivement de la DB
- Le filtre `archived` est applique cote client sur le champ `archived` (mappe depuis `archived_at`)
- Le filtre overdue compare `dueDate` avec la date actuelle, exclut `done`/`completed`

### Page complete (`/taches/[taskId]`)
- Charge via `fetch("/api/tasks")` puis `find(t => t.id === taskId)`
- Si pas trouve dans les actives, cherche dans `fetch("/api/tasks?archived=true")`
- Si introuvable : affiche "Tache introuvable" (pas de fallback mock)
- Autosave debounce 500ms via `persistTask()` → PATCH `/api/tasks`

### Archive (`/taches/archive`)
- Source : `useApi("/api/tasks?archived=true", [])`
- Fallback `[]` (array vide) si erreur — pas de mock
- Restauration via PATCH `{ id, archived: false, status: "todo" }`

### Recherche globale
- API `/api/search` fait une requete Supabase sur `tasks` avec `title.ilike`, `client_name.ilike`, `description.ilike`
- Retourne des resultats avec `href: /taches/${t.id}` (vrais IDs DB)
- Aucun fallback mock

### Client selector
- `ClientAutocomplete` fetch `/api/clients?q=...`
- Persistence via PATCH task avec `clientId` + `clientName`

### Overdue filter
- Logique dans `filterTasks(tasks, "overdue")` :
  - `dueDate != null`
  - `dueDate < today`
  - `status !== "done" && status !== "completed"`
- Exclut les taches archivees (filtrees en amont par le board)
- Fonctionne correctement sur des dates reelles

---

## 6. Flux de donnees unifie

```
                    Supabase DB (tasks table)
                           |
                    GET /api/tasks
                    GET /api/tasks?archived=true
                    GET /api/search?q=
                           |
              ┌────────────┼────────────────┐
              |            |                |
         TasksWorkspace  TaskPage      ArchivePage
         (board+drawer)  ([taskId])    (archive)
              |            |                |
         PATCH/POST    PATCH/DELETE      PATCH
         /api/tasks    /api/tasks       /api/tasks
              |            |                |
              └────────────┴────────────────┘
                           |
                    Supabase DB (write)
```

Toutes les mutations remontent a la meme API qui ecrit dans la meme table.

---

## 7. Remaining technical debt

1. **Page complete charge TOUTES les taches** : `fetch("/api/tasks")` recupere toutes les taches actives pour trouver celle avec le bon ID. Idealement, il faudrait un endpoint `/api/tasks/[id]` dedie.

2. **Recherche tags** : Les tags sont en JSONB. La recherche Supabase `.ilike` ne fonctionne pas sur les arrays JSONB. Une recherche par tag necesiterait un filtre supplementaire cote application ou une fonction PostgreSQL.

3. **Pas de `revalidatePath`** : Apres un PATCH depuis la page complete, le board Kanban ne se rafraichit pas automatiquement (il faut un reload manuel).

4. **POST optimiste** : Le board cree une tache avec un ID temporaire puis le remplace par l'ID DB. Si l'utilisateur interagit avec la tache pendant le POST, il pourrait y avoir une breve desynchronisation.

---

## 8. Commits

| Hash | Message |
|------|---------|
| `abd9fdd` | refactor(tasks): remove mock fallback from runtime task flows |
| `1dee580` | fix(tasks): remove all mock fallbacks, enforce real DB as single source of truth |
