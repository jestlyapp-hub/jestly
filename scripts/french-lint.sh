#!/bin/bash
# french-lint.sh — Build-time French quality gate for Jestly
#
# Usage:
#   bash scripts/french-lint.sh              # scan src/, warn mode
#   bash scripts/french-lint.sh --strict     # scan src/, fail on issues (CI mode)
#   bash scripts/french-lint.sh --fix-report # generate fix suggestions
#
# Exit codes:
#   0 = clean (or warn mode)
#   1 = issues found in strict mode

set -euo pipefail

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m'

STRICT=false
FIX_REPORT=false
for arg in "$@"; do
  case "$arg" in
    --strict) STRICT=true ;;
    --fix-report) FIX_REPORT=true ;;
  esac
done

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  French Copy Lint — Jestly                              ║"
echo "║  Détection des accents manquants et français dégradé    ║"
if $STRICT; then
echo "║  Mode: STRICT (bloque si erreurs trouvées)              ║"
fi
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

ISSUES=0
REAL_ISSUES=0
SCAN_DIR="src"

# ── WHITELIST ──
# Patterns that are false positives (URLs, CSS IDs, code identifiers, search keywords)
WHITELIST_PATTERNS=(
  'href="/parametres'
  'href="/taches'
  'redirect("/parametres'
  'id="securite"'
  'section: "securite"'
  'section: "donnees"'
  '/parametres#'
  '/parametres"'
  '__tests__'
  '\.test\.'
  'protectedPrefixes'
  'pathname.startsWith'
  'evenement: "event"'   # search keyword mapping (intentional)
  'tache: "task"'        # search keyword mapping (intentional)
  'termine.*done'        # search keyword mapping
  'livre.*delivered'     # search keyword mapping
)

# Build grep exclude pattern
WHITELIST_GREP=""
for wp in "${WHITELIST_PATTERNS[@]}"; do
  WHITELIST_GREP="${WHITELIST_GREP}|${wp}"
done
WHITELIST_GREP="${WHITELIST_GREP:1}" # remove leading |

# ── DETECTION PATTERNS ──
# Each entry: regex | description | severity (error|warn)
declare -a CHECKS
CHECKS=(
  # É manquant — HIGH priority (visible UI labels)
  'Parametres|Parametres → Paramètres|error'
  'Apercu|Aperçu manquant|error'
  'Creer\b|Créer manquant|error'
  'Telecharger|Télécharger manquant|error'
  'Resultat\b|Résultat manquant|error'
  'Evenement|Événement manquant|error'
  'Categorie|Catégorie manquant|error'
  'Activite\b|Activité manquant|error'
  'Identite\b|Identité manquant|error'
  'Echeance|Échéance manquant|error'
  'Temoignage|Témoignage manquant|error'
  'Realisation\b|Réalisation manquant|error'
  'Developpement|Développement manquant|error'

  # È manquant
  '\bmodele\b|modèle manquant|error'
  '\bpremiere\b|première manquant|warn'
  '\bderniere\b|dernière manquant|warn'

  # Ê manquant
  '\bPret\b|Prêt manquant|error'
  '\bEtre\b|Être manquant|error'

  # À / Â manquant
  'mise a jour|mise à jour manquant|error'
  'a partir\b|à partir manquant|warn'
  '\bdeja\b|déjà manquant|error'
  '\bTache\b|Tâche manquant|error'
  '\btache\b|tâche manquant|error'

  # Ç manquant
  '\bRecu\b|Reçu manquant|error'
  '\bConcu\b|Conçu manquant|error'

  # Participes passés sans accent
  '\bpayee\b|payée manquant|error'
  '\bcreee?\b|créé(e) manquant|error'
  '\bsupprimee\b|supprimée manquant|error'
  '\benvoyee\b|envoyée manquant|error'
  '\bfacturee\b|facturée manquant|error'
  '\blivree\b|livrée manquant|error'
  '\bterminee\b|terminée manquant|error'
  '\bvalidee\b|validée manquant|error'
  '\bpersonnalise\b|personnalisé manquant|warn'
  '\bverifie\b|vérifié manquant|warn'
  '\bconnecte\b|connecté manquant|warn'
)

for check in "${CHECKS[@]}"; do
  IFS='|' read -r pattern desc severity <<< "$check"

  # Search in string literals within .tsx/.ts files
  results=$(grep -rn -P "\"[^\"]*${pattern}[^\"]*\"" "$SCAN_DIR" \
    --include="*.tsx" --include="*.ts" \
    --exclude-dir=node_modules --exclude-dir=.next \
    2>/dev/null || true)

  # Filter out whitelisted patterns
  if [ -n "$results" ] && [ -n "$WHITELIST_GREP" ]; then
    filtered=$(echo "$results" | grep -v -E "$WHITELIST_GREP" 2>/dev/null || true)
  else
    filtered="$results"
  fi

  if [ -n "$filtered" ]; then
    count=$(echo "$filtered" | wc -l)
    ISSUES=$((ISSUES + count))

    if [ "$severity" = "error" ]; then
      echo -e "${RED}✗  $desc${NC} ($count)"
      REAL_ISSUES=$((REAL_ISSUES + count))
    else
      echo -e "${YELLOW}⚠  $desc${NC} ($count)"
    fi

    echo "$filtered" | head -5 | while IFS= read -r line; do
      echo -e "  ${DIM}${line}${NC}"
    done
    if [ "$count" -gt 5 ]; then
      echo -e "  ${DIM}... et $((count - 5)) autres${NC}"
    fi
    echo ""
  fi
done

# ── SUMMARY ──
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $ISSUES -eq 0 ]; then
  echo -e "${GREEN}✅ Aucune erreur d'accent détectée. Qualité française parfaite !${NC}"
  echo ""
  exit 0
elif [ $REAL_ISSUES -eq 0 ]; then
  echo -e "${YELLOW}⚠  $ISSUES avertissement(s) mineur(s) détecté(s).${NC}"
  echo -e "   Vérifiez manuellement. Consultez FRENCH_COPY_GUIDE.md."
  echo ""
  exit 0
else
  echo -e "${RED}❌ $REAL_ISSUES erreur(s) + $((ISSUES - REAL_ISSUES)) avertissement(s) détecté(s).${NC}"
  echo -e "   Corrigez les erreurs avant de merger."
  echo -e "   Consultez FRENCH_COPY_GUIDE.md pour les corrections."
  echo ""
  if $STRICT; then
    echo -e "${RED}BUILD BLOCKED — Fix French errors before committing.${NC}"
    exit 1
  fi
  exit 0
fi
