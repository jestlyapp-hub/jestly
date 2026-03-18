/**
 * french-guard.ts — Runtime French quality checker (DEV ONLY)
 *
 * Provides:
 * 1. FRENCH_CORRECTIONS — canonical map of bad → correct French
 * 2. checkFrench(text) — detects broken French in a string
 * 3. ensureFrench(text) — warns in dev, returns corrected text
 * 4. useFrenchGuard() — React hook for component-level checking
 *
 * All runtime checks are stripped in production (tree-shaken via process.env.NODE_ENV).
 */

// ═══════════════════════════════════════════════════════════════
// CANONICAL CORRECTION MAP
// Single source of truth for bad → correct French patterns.
// Used by: runtime checker, lint script, autocorrect.
// ═══════════════════════════════════════════════════════════════

export const FRENCH_CORRECTIONS: Record<string, string> = {
  // É manquant
  "Parametres": "Paramètres",
  "parametres": "paramètres",
  "Apercu": "Aperçu",
  "apercu": "aperçu",
  "Creer": "Créer",
  "creer": "créer",
  "Telecharger": "Télécharger",
  "telecharger": "télécharger",
  "Resultat": "Résultat",
  "resultat": "résultat",
  "Evenement": "Événement",
  "evenement": "événement",
  "Securite": "Sécurité",
  "securite": "sécurité",
  "Selectionner": "Sélectionner",
  "selectionner": "sélectionner",
  "Generer": "Générer",
  "generer": "générer",
  "Categorie": "Catégorie",
  "categorie": "catégorie",
  "Activite": "Activité",
  "activite": "activité",
  "Identite": "Identité",
  "identite": "identité",
  "Reussite": "Réussite",
  "reussite": "réussite",
  "Echeance": "Échéance",
  "echeance": "échéance",
  "Numero": "Numéro",
  "numero": "numéro",
  "Resume": "Résumé",
  "resume": "résumé",
  "Developpement": "Développement",
  "developpement": "développement",
  "Temoignage": "Témoignage",
  "temoignage": "témoignage",
  "Temoignages": "Témoignages",
  "temoignages": "témoignages",
  "Realisation": "Réalisation",
  "realisation": "réalisation",
  "Realisations": "Réalisations",
  "realisations": "réalisations",
  "Telephone": "Téléphone",
  "telephone": "téléphone",

  // È manquant
  "modele": "modèle",
  "Modele": "Modèle",
  "premiere": "première",
  "Premiere": "Première",
  "derniere": "dernière",
  "Derniere": "Dernière",
  "critere": "critère",

  // Ê manquant
  "Pret": "Prêt",
  "pret": "prêt",
  "Etre": "Être",
  "etre": "être",
  "Fenetre": "Fenêtre",
  "fenetre": "fenêtre",

  // Â manquant
  "Tache": "Tâche",
  "tache": "tâche",
  "taches": "tâches",

  // Ç manquant
  "Recu": "Reçu",
  "recu": "reçu",
  "Facon": "Façon",
  "facon": "façon",
  "Concu": "Conçu",
  "concu": "conçu",

  // Participes passés
  "cree": "créé",
  "creee": "créée",
  "Cree": "Créé",
  "supprimee": "supprimée",
  "modifiee": "modifiée",
  "envoyee": "envoyée",
  "facturee": "facturée",
  "livree": "livrée",
  "terminee": "terminée",
  "validee": "validée",
  "payee": "payée",
  "personnalise": "personnalisé",
  "verifie": "vérifié",
  "connecte": "connecté",

  // Phrases courantes
  "mise a jour": "mise à jour",
  "a partir": "à partir",
  "deja": "déjà",
  "Deja": "Déjà",
  "Equipe": "Équipe",
  "equipe": "équipe",
  "Etape": "Étape",
  "etape": "étape",
  "Etat": "État",
  "etat": "état",
};

// Build a regex from all keys (longest first to avoid partial matches)
const sortedKeys = Object.keys(FRENCH_CORRECTIONS).sort((a, b) => b.length - a.length);
const PATTERN = new RegExp(`\\b(${sortedKeys.map(k => k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})\\b`, "g");

// ═══════════════════════════════════════════════════════════════
// CORE FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export interface FrenchIssue {
  found: string;
  expected: string;
  index: number;
}

/**
 * Check a string for broken French. Returns list of issues found.
 * Only runs in development.
 */
export function checkFrench(text: string): FrenchIssue[] {
  if (process.env.NODE_ENV === "production") return [];
  if (!text || typeof text !== "string") return [];

  const issues: FrenchIssue[] = [];
  let match: RegExpExecArray | null;

  // Reset regex state
  PATTERN.lastIndex = 0;

  while ((match = PATTERN.exec(text)) !== null) {
    const found = match[1];
    const correction = FRENCH_CORRECTIONS[found];
    if (correction) {
      issues.push({ found, expected: correction, index: match.index });
    }
  }

  return issues;
}

/**
 * Ensure French quality. In dev: logs warnings and returns corrected text.
 * In production: returns text unchanged (zero overhead).
 */
export function ensureFrench(text: string): string {
  if (process.env.NODE_ENV === "production") return text;
  if (!text || typeof text !== "string") return text;

  const issues = checkFrench(text);

  if (issues.length > 0) {
    const corrections = issues.map(i => `  "${i.found}" → "${i.expected}"`).join("\n");
    console.warn(
      `[FrenchGuard] Broken French detected:\n` +
      `  Text: "${text.slice(0, 80)}${text.length > 80 ? "..." : ""}"\n` +
      corrections + "\n" +
      `  Fix the source string. See FRENCH_COPY_GUIDE.md`
    );
  }

  // Return corrected version (dev convenience — source should still be fixed)
  let corrected = text;
  PATTERN.lastIndex = 0;
  corrected = corrected.replace(PATTERN, (match) => FRENCH_CORRECTIONS[match] ?? match);
  return corrected;
}

// ═══════════════════════════════════════════════════════════════
// REACT HOOK — useFrenchGuard
// ═══════════════════════════════════════════════════════════════

/**
 * React hook: checks an object of label strings for broken French.
 * Logs warnings in dev. No-op in production.
 *
 * Usage:
 *   useFrenchGuard({ title: "Parametres", cta: "Creer" }, "MyComponent");
 */
export function useFrenchGuard(
  labels: Record<string, string | undefined | null>,
  componentName?: string
): void {
  if (process.env.NODE_ENV === "production") return;

  // Use a simple check on mount (no useEffect to avoid import issues in server components)
  const entries = Object.entries(labels);
  for (const [key, value] of entries) {
    if (!value) continue;
    const issues = checkFrench(value);
    if (issues.length > 0) {
      const fixes = issues.map(i => `    "${i.found}" → "${i.expected}"`).join("\n");
      console.warn(
        `[FrenchGuard] ${componentName ?? "Component"}.${key}:\n` +
        `    Value: "${value.slice(0, 60)}${value.length > 60 ? "..." : ""}"\n` +
        fixes
      );
    }
  }
}
