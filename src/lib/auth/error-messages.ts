/**
 * Traduit les messages d'erreur Supabase Auth en français.
 * Ne jamais afficher les messages bruts de Supabase à l'utilisateur.
 */

const ERROR_MAP: Record<string, string> = {
  // Password
  "New password should be different from the old password.":
    "Le nouveau mot de passe doit être différent de l'ancien.",
  "Password should be at least 6 characters.":
    "Le mot de passe doit contenir au moins 6 caractères.",
  "Password should be at least 8 characters.":
    "Le mot de passe doit contenir au moins 8 caractères.",

  // Session / token
  "Invalid Refresh Token: Refresh Token Not Found":
    "Ta session a expiré. Demande un nouveau lien de réinitialisation.",
  "Token has expired or is invalid":
    "Le lien a expiré ou est invalide. Demande un nouveau lien.",
  "User not found":
    "Aucun compte trouvé avec cet email.",
  "Invalid login credentials":
    "Email ou mot de passe incorrect.",
  "Email not confirmed":
    "Ton email n'est pas encore confirmé. Vérifie ta boîte mail.",

  // Rate limit
  "For security purposes, you can only request this after":
    "Trop de tentatives. Réessaie dans quelques minutes.",
  "Rate limit exceeded":
    "Trop de tentatives. Réessaie dans quelques minutes.",

  // Network
  "Failed to fetch":
    "Erreur de connexion. Vérifie ta connexion internet.",
  "NetworkError":
    "Erreur de connexion. Vérifie ta connexion internet.",

  // Auth session
  "Auth session missing!":
    "Ta session a expiré. Demande un nouveau lien de réinitialisation.",
  "Session expired":
    "Ta session a expiré. Reconnecte-toi.",
};

export function translateAuthError(message: string): string {
  // Exact match
  if (ERROR_MAP[message]) return ERROR_MAP[message];

  // Partial match (Supabase sometimes adds context to messages)
  for (const [key, value] of Object.entries(ERROR_MAP)) {
    if (message.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }

  // Fallback — generic French message
  return "Une erreur est survenue. Réessaie ou demande un nouveau lien.";
}
