# V2 Audit — Jestly

## Etat actuel par module

### Calendrier
- **Utilite produit**: Forte — vue planning centrale pour freelances
- **Qualite UX**: Bonne — 3 vues fonctionnelles, navigation fluide
- **Coherence visuelle**: Tres bonne — couleurs unifiees au DS, borders normalisees (#EFEFEF)
- **Solidite technique**: Bonne — DELETE API fonctionnelle, error logging
- **Coherence donnees**: Bonne — sync automatique des deadlines commandes
- **Relations inter-entites**: Bonne — RelationBadges client/produit/commande dans EventDetailDrawer
- **Responsivite**: Bonne — scroll horizontal mobile, min-h ajuste, max-h responsive
- **Accessibilite**: Bonne — ARIA labels nav, dialog roles sur modale/drawer
- **Performance**: Bonne — pas de re-renders inutiles
- **Maintenabilite**: Bonne — separation claire composants/utils, code propre

### Taches
- **Utilite produit**: Forte — kanban + list + archive = workflow complet
- **Qualite UX**: Bonne — drag-drop, quick add, detail drawer
- **Coherence visuelle**: Tres bonne — couleurs DS unifiees, borders normalisees
- **Solidite technique**: Bonne — error logging API, error state ajoute
- **Coherence donnees**: Moyenne — mock data en fallback, pas de persistence reelle
- **Relations inter-entites**: Bonne — RelationBadges client/commande dans TaskCard et TaskDetailDrawer
- **Responsivite**: Bonne — kanban scroll horizontal, skeleton responsive
- **Accessibilite**: Bonne — ARIA labels vue toggle/archive, dialog role drawer, labels checkboxes
- **Performance**: Bonne — useMemo pour filtrage, sensors DnD optimises
- **Maintenabilite**: Bonne — types bien definis, helpers centralises

### Recherche globale
- **Utilite produit**: Forte — command palette cross-entites
- **Qualite UX**: Tres bonne — keyboard nav, highlight, grouped results
- **Coherence visuelle**: Tres bonne — couleurs DS unifiees, borders normalisees
- **Solidite technique**: Bonne — debounce, fallback API/mock, indexOf pur
- **Coherence donnees**: Bonne — dates relatives, detection OS pour raccourci
- **Relations inter-entites**: Bonne — navigue vers les bonnes pages
- **Responsivite**: Bonne — dropdown s'adapte
- **Accessibilite**: Bonne — role combobox, aria-expanded, listbox results
- **Performance**: Bonne — debounce 300ms
- **Maintenabilite**: Bonne — search-utils bien structure

### Dashboard
- **Utilite produit**: Forte — control center quotidien avec navigation inter-modules
- **Qualite UX**: Tres bonne — widgets cliquables, quick actions, navigation fluide
- **Coherence visuelle**: Tres bonne — cards uniformes, animations coherentes, DS unifie
- **Solidite technique**: Bonne — WorkloadSnapshot utilise props API, edge cases geres
- **Coherence donnees**: Moyenne — widgets mock (TodayFocus, UpcomingDeadlines) mais liens fonctionnels
- **Relations inter-entites**: Tres bonne — RelationBadges, liens modules, WorkloadSnapshot navigable
- **Responsivite**: Bonne — grid responsive, header empile sur mobile, popovers contraints
- **Accessibilite**: Bonne — ARIA roles dialog/menu sur popovers, labels boutons
- **Performance**: Bonne — staggered animations
- **Maintenabilite**: Bonne — widgets isoles

## Issues trouvees et fixes appliques (V2)

### P0 (Critique)
1. ~~CalendarWorkspace: DELETE API pas implementee~~ → FIXE: API DELETE ajoutee
2. ~~TasksWorkspace: erreurs API swallowed~~ → FIXE: console.error ajoute
3. ~~Topbar: bouton "Nouveau" sans handler~~ → FIXE: supprime (QuickActions existe)

### P1 (Majeur)
1. ~~WeekView/DayView: max-h hardcode non responsive~~ → FIXE: valeurs ajustees
2. ~~WorkloadSnapshot: donnees hardcodees~~ → FIXE: utilise props stats
3. ~~GlobalSearch: fallback silent a mock~~ → Accepte (comportement voulu)
4. ~~ActivityFeed: lien /activite inexistant~~ → FIXE: redirige vers /commandes
5. ~~NotificationPanel: badge w-4.5 non-standard~~ → FIXE: utilise w-[18px]
6. ~~calendar-utils: accents manquants~~ → FIXE
7. ~~search-utils: dates 2025 perimees~~ → FIXE: dates relatives

### P2 (Moyen)
1. ~~GlobalSearch: globalIdx mutable~~ → FIXE: utilise indexOf
2. ~~GlobalSearch: kbd hint Mac-only~~ → FIXE: detection OS

## Risques reduits
- Perte de donnees calendrier (DELETE API fonctionnelle)
- Confusion utilisateur (bouton mort supprime)
- Dates incoherentes (accents + mock dates fixes)
- Overflow calendrier (max-h ajuste)

## Phases V2 completees

### Phase 5 — Unification design system (13 fichiers)
- Couleurs non-standard normalisees (#F0F0EE → #EFEFEF, #FAFAF9 → #F7F7F5, bg-gray-100 → #F7F7F5)
- Backgrounds non-standard remplaces par tokens DS (#EEF2FF/30 pour accent tint)
- Borders unifiees : #EFEFEF (subtle), #E6E6E4 (main)

### Phase 6 — Relations inter-entites (5 fichiers)
- RelationBadges integres dans TaskCard, TaskDetailDrawer, EventDetailDrawer, UpcomingDeadlines
- Navigation client/commande/produit cliquable dans tous les modules

### Phase 7 — Dashboard centre de controle (4 fichiers)
- TodayFocus : items cliquables avec liens vers /taches et /calendrier
- UpcomingDeadlines : titres cliquables, RelationBadges clients
- WorkloadSnapshot : chaque metrique navigable vers son module

### Phase 8 — Qualite (4 fichiers)
- Error state ajoute dans TasksWorkspace
- Edge cases : titres vides (fallback "Sans titre"), texte long (truncate), colonnes table dashboard

### Phase 9 — Responsivite + accessibilite (10 fichiers)
- Scroll horizontal mobile pour MonthView et WeekView
- Header dashboard empile sur mobile
- Popovers contraints (max-w calc)
- ARIA : role="dialog" sur drawers/modales, aria-label sur boutons icone, role="combobox" sur search

### Phase 10 — Nettoyage code (1 fichier)
- Variable inutilisee lastOfMonth supprimee
- 0 imports inutilises, 0 any, 0 console.log debug
- 3 patterns de duplication identifies (optionnels) : useClickOutside, eventsByDate, useCurrentTimePosition

## Dette restante
- Tables Supabase calendar_events et tasks non creees (migrations a faire)
- Dashboard widgets TodayFocus/UpcomingDeadlines toujours en mock
- Relations tasks → clients/orders sont textuelles, pas des FK
- Pas de tests unitaires
- Pas de dark mode
- Hooks extractibles : useClickOutside, useCurrentTimePosition (optionnel)
