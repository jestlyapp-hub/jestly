/**
 * Mode Bêta Open Access
 *
 * Pendant la bêta V1, toutes les fonctionnalités sont accessibles
 * gratuitement. Les abonnements restent dans le code mais ne sont
 * pas imposés.
 *
 * Pour réactiver la monétisation :
 * → Supprimer NEXT_PUBLIC_BETA_OPEN_ACCESS de .env
 * → Ou le passer à "false"
 *
 * Ce fichier est le SEUL endroit qui détermine si le mode bêta est actif.
 */

/**
 * Vérifie si le mode bêta open access est activé.
 * Fonctionne côté client ET côté serveur (NEXT_PUBLIC_).
 */
export function isBetaOpenAccess(): boolean {
  return process.env.NEXT_PUBLIC_BETA_OPEN_ACCESS === "true";
}

/**
 * Vérifie si les restrictions billing doivent être appliquées.
 * Inverse de isBetaOpenAccess() — pour une lecture plus claire dans les guards.
 */
export function shouldEnforceBilling(): boolean {
  return !isBetaOpenAccess();
}
