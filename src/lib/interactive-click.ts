/**
 * Utilitaire centralisé pour filtrer les clics provenant d'éléments interactifs.
 *
 * Utilisé sur les lignes de table (commandes, clients, etc.) pour n'ouvrir
 * un drawer/panel que si le clic provient d'une zone neutre.
 *
 * Pour marquer explicitement un élément comme non-déclencheur :
 *   <div data-no-drawer>…</div>
 */

const INTERACTIVE_SELECTORS = [
  "a",
  "button",
  "input",
  "select",
  "textarea",
  "label",
  '[role="button"]',
  '[role="checkbox"]',
  '[role="switch"]',
  '[role="menuitem"]',
  '[role="option"]',
  '[role="link"]',
  '[role="combobox"]',
  "[data-no-drawer]",
] as const;

const INTERACTIVE_SELECTOR = INTERACTIVE_SELECTORS.join(",");

/**
 * Retourne `true` si le clic provient d'un élément interactif
 * (ou d'un enfant d'un élément interactif) à l'intérieur du conteneur.
 *
 * @param e        — l'événement clic React
 * @param container — le conteneur (la ligne <tr>) qui porte le onClick
 */
export function isInteractiveClick(
  e: React.MouseEvent,
  container?: HTMLElement | null,
): boolean {
  const target = e.target as HTMLElement | null;
  if (!target) return false;

  // Remonte le DOM du target jusqu'au conteneur (exclu).
  // Si on croise un élément interactif, c'est un clic interactif.
  const boundary = container ?? e.currentTarget;
  let node: HTMLElement | null = target;

  while (node && node !== boundary) {
    if (node.matches(INTERACTIVE_SELECTOR)) return true;
    node = node.parentElement;
  }

  return false;
}
