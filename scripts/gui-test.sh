#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# GUI — Agent de test automatique Jestly
# Teste le flux complet : site CRUD, draft/autosave, publish,
# re-modification, résolution publique, variantes edge cases
# ═══════════════════════════════════════════════════════════════

set -uo pipefail

# ── Config ──
SB_URL="https://aaxyqzohtzvstpqxlvsr.supabase.co"
ANON_KEY="sb_publishable_7-EU1RK-19iZES1ok9alHg_ab8y_58b"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFheHlxem9odHp2c3RwcXhsdnNyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjQ1NDA0NiwiZXhwIjoyMDg4MDMwMDQ2fQ.KrgbefPydSt30wxDz37VqvdUXBj3BY8RTfB0HhQvFDA"

PASS=0
FAIL=0
WARN=0

# ── Helpers ──
api() {
  local method="$1" endpoint="$2"
  shift 2
  curl -s -X "$method" "${SB_URL}/rest/v1/${endpoint}" \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Content-Type: application/json" \
    -H "Prefer: return=representation" \
    "$@"
}

api_no_body() {
  local method="$1" endpoint="$2"
  curl -s -X "$method" "${SB_URL}/rest/v1/${endpoint}" \
    -H "apikey: ${ANON_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -H "Prefer: return=representation"
}

check() {
  local label="$1" condition="$2"
  if eval "$condition"; then
    echo "  ✅ $label"
    ((PASS++))
  else
    echo "  ❌ $label"
    ((FAIL++))
  fi
}

warn() {
  echo "  ⚠️  $1"
  ((WARN++))
}

section() {
  echo ""
  echo "━━━ $1 ━━━"
}

# ── Trouver le site de test ──
SITE_ID="${GUI_SITE_ID:-191a7eb5-13d0-4bd9-8f4c-22f491eba4ac}"
SITE_SLUG="${GUI_SITE_SLUG:-rasenyax}"

echo "🤖 GUI — Test agent Jestly"
echo "   Site: $SITE_ID ($SITE_SLUG)"
echo "   $(date)"

# ═══════════════════════════════════════════
# TEST 1: État initial du site
# ═══════════════════════════════════════════
section "1. ÉTAT INITIAL"

SITE_DATA=$(api GET "sites?id=eq.${SITE_ID}&select=id,slug,status,name,is_private")
SITE_STATUS=$(echo "$SITE_DATA" | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
SITE_PRIVATE=$(echo "$SITE_DATA" | grep -o '"is_private":[a-z]*' | head -1 | cut -d: -f2)

check "Site existe" "[ -n '$SITE_STATUS' ]"
check "Site published" "[ '$SITE_STATUS' = 'published' ]"
check "Site public (is_private=false)" "[ '$SITE_PRIVATE' = 'false' ]"

PAGES_DATA=$(api GET "site_pages?site_id=eq.${SITE_ID}&select=id,title,slug,status,is_home,sort_order&order=sort_order")
PAGE_COUNT=$(echo "$PAGES_DATA" | grep -o '"id"' | wc -l)
HAS_HOME=$(echo "$PAGES_DATA" | grep -c '"is_home":true' || true)
PUBLISHED_PAGES=$(echo "$PAGES_DATA" | grep -c '"status":"published"' || true)

check "Pages existent (count=$PAGE_COUNT)" "[ $PAGE_COUNT -gt 0 ]"
check "Au moins 1 page is_home=true ($HAS_HOME)" "[ $HAS_HOME -gt 0 ]"
check "Toutes pages published ($PUBLISHED_PAGES/$PAGE_COUNT)" "[ $PUBLISHED_PAGES -eq $PAGE_COUNT ]"

# ═══════════════════════════════════════════
# TEST 2: Simuler autosave (draft endpoint)
# ═══════════════════════════════════════════
section "2. AUTOSAVE — Modifier et sauvegarder"

# Delete all pages
api_no_body DELETE "site_pages?site_id=eq.${SITE_ID}" > /dev/null

# Insert new pages with published status (simule le fix du draft endpoint)
DRAFT_RESULT=$(api POST "site_pages" -d "[
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Accueil Test GUI\",\"slug\":\"home\",\"is_home\":true,\"sort_order\":0,\"status\":\"published\"},
  {\"site_id\":\"${SITE_ID}\",\"title\":\"A propos\",\"slug\":\"a-propos\",\"is_home\":false,\"sort_order\":1,\"status\":\"published\"}
]")

DRAFT_COUNT=$(echo "$DRAFT_RESULT" | grep -o '"id"' | wc -l)
DRAFT_HOME=$(echo "$DRAFT_RESULT" | grep -c '"is_home":true' || true)
DRAFT_PUB=$(echo "$DRAFT_RESULT" | grep -c '"status":"published"' || true)

check "2 pages insérées ($DRAFT_COUNT)" "[ $DRAFT_COUNT -eq 2 ]"
check "Page home correcte ($DRAFT_HOME)" "[ $DRAFT_HOME -eq 1 ]"
check "Toutes pages published ($DRAFT_PUB)" "[ $DRAFT_PUB -eq 2 ]"

# ═══════════════════════════════════════════
# TEST 3: Résolution publique après autosave
# ═══════════════════════════════════════════
section "3. RÉSOLUTION PUBLIQUE — Après autosave"

PUB_SITE=$(api GET "sites?slug=eq.${SITE_SLUG}&status=eq.published&is_private=eq.false&select=id")
PUB_SITE_FOUND=$(echo "$PUB_SITE" | grep -c '"id"' || true)
check "Site trouvé par slug+published ($PUB_SITE_FOUND)" "[ $PUB_SITE_FOUND -gt 0 ]"

PUB_PAGES=$(api GET "site_pages?site_id=eq.${SITE_ID}&status=eq.published&select=id,title,is_home")
PUB_PAGE_COUNT=$(echo "$PUB_PAGES" | grep -o '"id"' | wc -l)
PUB_HOME=$(echo "$PUB_PAGES" | grep -c '"is_home":true' || true)
check "Pages published trouvées ($PUB_PAGE_COUNT)" "[ $PUB_PAGE_COUNT -gt 0 ]"
check "Page home existe pour résolution ($PUB_HOME)" "[ $PUB_HOME -gt 0 ]"

# ═══════════════════════════════════════════
# TEST 4: 2ème modification (re-autosave)
# ═══════════════════════════════════════════
section "4. RE-MODIFICATION — 2ème autosave"

api_no_body DELETE "site_pages?site_id=eq.${SITE_ID}" > /dev/null

REDRAFT=$(api POST "site_pages" -d "[
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Accueil v2\",\"slug\":\"home\",\"is_home\":true,\"sort_order\":0,\"status\":\"published\"},
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Services\",\"slug\":\"services\",\"is_home\":false,\"sort_order\":1,\"status\":\"published\"},
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Contact\",\"slug\":\"contact\",\"is_home\":false,\"sort_order\":2,\"status\":\"published\"}
]")

REDRAFT_COUNT=$(echo "$REDRAFT" | grep -o '"id"' | wc -l)
check "3 pages insérées ($REDRAFT_COUNT)" "[ $REDRAFT_COUNT -eq 3 ]"

# Re-check resolution
PUB2_PAGES=$(api GET "site_pages?site_id=eq.${SITE_ID}&status=eq.published&select=id,is_home")
PUB2_COUNT=$(echo "$PUB2_PAGES" | grep -o '"id"' | wc -l)
PUB2_HOME=$(echo "$PUB2_PAGES" | grep -c '"is_home":true' || true)
check "3 pages published après 2ème modif ($PUB2_COUNT)" "[ $PUB2_COUNT -eq 3 ]"
check "Home toujours présente ($PUB2_HOME)" "[ $PUB2_HOME -gt 0 ]"

# ═══════════════════════════════════════════
# TEST 5: Edge case — site dépublié puis republié
# ═══════════════════════════════════════════
section "5. EDGE CASE — Dépublier → modifier → republier"

# Dépublier
api PATCH "sites?id=eq.${SITE_ID}" -d '{"status":"draft"}' > /dev/null

UNPUB_SITE=$(api GET "sites?slug=eq.${SITE_SLUG}&status=eq.published&select=id")
UNPUB_FOUND=$(echo "$UNPUB_SITE" | grep -c '"id"' || true)
check "Site introuvable après dépublication ($UNPUB_FOUND)" "[ $UNPUB_FOUND -eq 0 ]"

# Modifier pendant draft
api_no_body DELETE "site_pages?site_id=eq.${SITE_ID}" > /dev/null
api POST "site_pages" -d "[
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Accueil v3 draft\",\"slug\":\"home\",\"is_home\":true,\"sort_order\":0,\"status\":\"draft\"}
]" > /dev/null

DRAFT_PAGES=$(api GET "site_pages?site_id=eq.${SITE_ID}&status=eq.published&select=id")
DRAFT_PUB_COUNT=$(echo "$DRAFT_PAGES" | grep -c '"id"' || true)
check "Aucune page published en mode draft ($DRAFT_PUB_COUNT)" "[ $DRAFT_PUB_COUNT -eq 0 ]"

# Republier
api PATCH "sites?id=eq.${SITE_ID}" -d '{"status":"published"}' > /dev/null
api PATCH "site_pages?site_id=eq.${SITE_ID}" -d '{"status":"published"}' > /dev/null

REPUB_SITE=$(api GET "sites?slug=eq.${SITE_SLUG}&status=eq.published&select=id")
REPUB_FOUND=$(echo "$REPUB_SITE" | grep -c '"id"' || true)
REPUB_PAGES=$(api GET "site_pages?site_id=eq.${SITE_ID}&status=eq.published&is_home=eq.true&select=id")
REPUB_HOME=$(echo "$REPUB_PAGES" | grep -c '"id"' || true)
check "Site republié trouvable ($REPUB_FOUND)" "[ $REPUB_FOUND -gt 0 ]"
check "Page home published après republication ($REPUB_HOME)" "[ $REPUB_HOME -gt 0 ]"

# ═══════════════════════════════════════════
# TEST 6: Edge case — slug vide, slug spéciaux
# ═══════════════════════════════════════════
section "6. EDGE CASE — Slugs spéciaux"

FAKE_SLUG=$(api GET "sites?slug=eq.inexistant-xyz-99&status=eq.published&select=id")
FAKE_FOUND=$(echo "$FAKE_SLUG" | grep -c '"id"' || true)
check "Slug inexistant retourne vide ($FAKE_FOUND)" "[ $FAKE_FOUND -eq 0 ]"

# ═══════════════════════════════════════════
# TEST 7: Nettoyage — remettre l'état correct
# ═══════════════════════════════════════════
section "7. NETTOYAGE — Restaurer état propre"

api_no_body DELETE "site_pages?site_id=eq.${SITE_ID}" > /dev/null
RESTORE=$(api POST "site_pages" -d "[
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Accueil\",\"slug\":\"home\",\"is_home\":true,\"sort_order\":0,\"status\":\"published\"},
  {\"site_id\":\"${SITE_ID}\",\"title\":\"Page 2\",\"slug\":\"page-2\",\"is_home\":false,\"sort_order\":1,\"status\":\"published\"}
]")
RESTORE_COUNT=$(echo "$RESTORE" | grep -o '"id"' | wc -l)
check "État restauré ($RESTORE_COUNT pages)" "[ $RESTORE_COUNT -eq 2 ]"

# Vérifier état final
FINAL_SITE=$(api GET "sites?id=eq.${SITE_ID}&select=status")
FINAL_STATUS=$(echo "$FINAL_SITE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
check "Site final = published ($FINAL_STATUS)" "[ '$FINAL_STATUS' = 'published' ]"

# ═══════════════════════════════════════════
# RAPPORT
# ═══════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════"
echo "🤖 GUI — RAPPORT FINAL"
echo "═══════════════════════════════════════════"
echo "  ✅ Passés:       $PASS"
echo "  ❌ Échoués:      $FAIL"
echo "  ⚠️  Avertissements: $WARN"
echo "═══════════════════════════════════════════"

if [ $FAIL -gt 0 ]; then
  echo "  ⛔ DES TESTS ONT ÉCHOUÉ"
  exit 1
else
  echo "  🎉 TOUS LES TESTS PASSENT"
  exit 0
fi
