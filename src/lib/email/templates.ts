import type { WaitlistTemplateKey } from "./types";

interface TemplateData {
  first_name: string;
}

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/** Escape HTML special chars to prevent XSS in email templates */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// ─── Shared layout ───────────────────────────────────────────
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Jestly</title>
</head>
<body style="margin:0;padding:0;background:#f0eff5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0eff5;padding:40px 16px">
<tr><td align="center">
  <!-- Logo -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
  <tr><td align="center">
    <a href="https://jestly.fr" target="_blank" style="text-decoration:none">
      <img src="https://jestly.fr/logo-color.png" alt="Jestly" width="40" height="40" style="display:block;border-radius:10px;border:0;outline:none">
    </a>
  </td></tr>
  </table>

  <!-- Card -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
  <tr><td style="padding:40px 36px">
    ${content}
  </td></tr>
  </table>

  <!-- Footer -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;max-width:560px;width:100%">
  <tr><td align="center" style="padding:0 36px">
    <p style="margin:0 0 8px;font-size:12px;color:#94A3B8;line-height:1.6">
      <a href="https://jestly.fr" style="color:#7C3AED;text-decoration:none;font-weight:500">Jestly</a> &mdash; Le cockpit tout-en-un pour freelances cr&eacute;atifs<br>
      &copy; 2026 Rasenya. Tous droits r&eacute;serv&eacute;s.
    </p>
    <p style="margin:0;font-size:11px;color:#b0b0b0;line-height:1.5">
      Vous recevez cet email car vous vous &ecirc;tes inscrit(e) &agrave; la waitlist Jestly sur <a href="https://jestly.fr" style="color:#b0b0b0">jestly.fr</a>.
    </p>
  </td></tr>
  </table>

</td></tr>
</table>
</body>
</html>`;
}

function ctaButton(text: string, href: string, strong = false): string {
  const bg = strong
    ? "background:linear-gradient(135deg,#7C3AED 0%,#6366F1 100%)"
    : "background:#7C3AED";
  const shadow = strong
    ? "box-shadow:0 4px 14px rgba(124,58,237,0.35)"
    : "box-shadow:0 2px 8px rgba(124,58,237,0.2)";
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0">
<tr><td align="center" style="border-radius:10px;${bg};${shadow}">
  <a href="${href}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:10px;letter-spacing:0.02em">${text}</a>
</td></tr>
</table>`;
}

function heading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#1a1a2e;line-height:1.3">${text}</h1>`;
}

function paragraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#4a4a6a;line-height:1.65">${text}</p>`;
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #f0eff5;margin:24px 0">`;
}

function benefitRow(icon: string, title: string, desc: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px">
<tr>
  <td width="36" valign="top" style="padding-right:12px">
    <div style="width:32px;height:32px;border-radius:8px;background:#f0eff5;text-align:center;line-height:32px;font-size:16px">${icon}</div>
  </td>
  <td valign="top">
    <p style="margin:0;font-size:14px;font-weight:600;color:#1a1a2e">${title}</p>
    <p style="margin:2px 0 0;font-size:13px;color:#6b7280;line-height:1.5">${desc}</p>
  </td>
</tr>
</table>`;
}

// ─── Templates ───────────────────────────────────────────────

function confirmationWaitlist(data: TemplateData): RenderedEmail {
  const safe = escapeHtml(data.first_name);
  const html = layout(`
    ${heading(`Bienvenue ${safe} \u{1F44B}`)}
    ${paragraph(`Votre inscription à la waitlist Jestly est confirmée. Vous faites désormais partie des premiers à découvrir le cockpit tout-en-un conçu pour les freelances créatifs.`)}
    ${paragraph(`Jestly réunit commandes, workflow, facturation, site vitrine, agenda et fichiers en un seul espace — simple, rapide, premium.`)}
    ${paragraph(`On vous tiendra informé(e) dès que les portes s'ouvriront.`)}
    ${ctaButton("Découvrir Jestly", "https://jestly.fr")}
  `);

  return {
    subject: "Bienvenue dans la waitlist Jestly",
    html,
    text: `Bienvenue ${data.first_name} !\n\nVotre inscription à la waitlist Jestly est confirmée. Vous faites désormais partie des premiers à découvrir le cockpit tout-en-un conçu pour les freelances créatifs.\n\nJestly réunit commandes, workflow, facturation, site vitrine, agenda et fichiers en un seul espace.\n\nOn vous tiendra informé(e) dès que les portes s'ouvriront.\n\nhttps://jestly.fr\n\n---\nJestly — Le cockpit tout-en-un pour freelances créatifs\nVous recevez cet email car vous vous êtes inscrit(e) à la waitlist Jestly sur jestly.fr.`,
  };
}

function teasingProduit(data: TemplateData): RenderedEmail {
  const safe = escapeHtml(data.first_name);
  const html = layout(`
    ${heading(`${safe}, Jestly prend forme`)}
    ${paragraph(`Le cockpit freelance avance vite. Voici un aperçu de ce qui vous attend :`)}
    ${divider()}
    ${benefitRow("\u{1F3AF}", "Commandes centralisées", "Suivez chaque projet client de la demande à la livraison, sans tableur.")}
    ${benefitRow("\u{26A1}", "Workflow Kanban intelligent", "Organisez votre activité avec une vue claire et fluide, inspirée de Notion.")}
    ${benefitRow("\u{1F4C4}", "Facturation intégrée", "Générez vos factures depuis vos commandes. Zéro outil externe.")}
    ${divider()}
    ${paragraph(`Le tout dans une interface unique, pensée pour les créatifs qui veulent avancer sans friction.`)}
    ${ctaButton("Suivre le lancement", "https://jestly.fr")}
  `);

  return {
    subject: "Jestly prend forme",
    html,
    text: `${data.first_name}, Jestly prend forme.\n\nLe cockpit freelance avance vite. Voici un aperçu :\n\n- Commandes centralisées : suivez chaque projet client de A à Z\n- Workflow Kanban intelligent : organisez votre activité clairement\n- Facturation intégrée : générez vos factures depuis vos commandes\n\nLe tout dans une interface unique, pensée pour les créatifs.\n\nhttps://jestly.fr\n\n---\nJestly — Le cockpit tout-en-un pour freelances créatifs\nVous recevez cet email car vous vous êtes inscrit(e) à la waitlist Jestly sur jestly.fr.`,
  };
}

function invitationBeta(data: TemplateData): RenderedEmail {
  const safe = escapeHtml(data.first_name);
  const html = layout(`
    ${heading(`${safe}, la bêta Jestly est ouverte`)}
    ${paragraph(`Tu fais partie des premiers inscrits. On t'avait promis un accès prioritaire — le voici.`)}
    ${paragraph(`Jestly est maintenant ouvert : commandes, facturation, clients, site vitrine, agenda — tout est inclus gratuitement pendant la bêta.`)}
    ${ctaButton("Créer mon compte gratuitement \u2192", "https://jestly.fr/signup", true)}
    <p style="margin:8px 0 0;font-size:12px;color:#8A8A88;text-align:center">Gratuit · Aucun engagement · Prêt en 30 secondes</p>
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#94A3B8">Ton retour nous aidera à construire l'outil parfait. Si tu as une question, réponds simplement à cet email.</span>`)}
  `);

  return {
    subject: "La bêta Jestly est ouverte — ton accès est prêt",
    html,
    text: `${data.first_name}, la bêta Jestly est ouverte.\n\nTu fais partie des premiers inscrits. Jestly est maintenant ouvert : commandes, facturation, clients, site vitrine, agenda — tout est inclus gratuitement.\n\nCréer mon compte : https://jestly.fr/signup\n\nGratuit · Aucun engagement · Prêt en 30 secondes\n\n---\nJestly — Le cockpit du freelance moderne\njestly.fr`,
  };
}

function lancementOfficiel(data: TemplateData): RenderedEmail {
  const safe = escapeHtml(data.first_name);

  const checkIcon = `<span style="display:inline-block;width:20px;height:20px;background:#f0eeff;border-radius:6px;text-align:center;line-height:20px;font-size:12px;color:#7C3AED;font-weight:bold">&#10003;</span>`;

  function benefitLine(title: string, desc: string): string {
    return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:10px">
<tr><td width="28" valign="top" style="padding-top:2px">${checkIcon}</td>
<td style="padding-left:10px"><span style="font-size:14px;color:#111118;font-weight:600">${title}</span><br><span style="font-size:13px;color:#8A8A88">${desc}</span></td></tr></table>`;
  }

  const badgeHtml = `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px"><tr><td style="background:#f0eeff;border-radius:20px;padding:6px 16px"><span style="font-size:11px;font-weight:700;color:#7C3AED;letter-spacing:0.08em;text-transform:uppercase">Lancement officiel</span></td></tr></table>`;

  const html = layout(`
    ${badgeHtml}
    ${heading(`Jestly est live. Ton espace t'attend.`)}
    ${paragraph(`${safe}, c'est officiel — après des mois de construction, Jestly est ouvert. Tu fais partie des premiers à y accéder.`)}
    ${divider()}
    <p style="margin:0 0 14px;font-size:13px;font-weight:700;color:#111118;text-transform:uppercase;letter-spacing:0.06em">Ce que ça change pour toi</p>
    ${benefitLine("5h gagnées par semaine", "Fini les allers-retours entre 10 outils.")}
    ${benefitLine("Commandes, factures, clients — un seul endroit", "Tout centralisé, rien ne se perd.")}
    ${benefitLine("Un site vitrine pro en 10 minutes", "Ton portfolio en ligne, sans code.")}
    ${benefitLine("Pilote tout depuis un seul dashboard", "Conçu pour les freelances, pas pour les entreprises.")}
    ${ctaButton("Créer mon compte gratuitement \u2192", "https://jestly.fr/signup", true)}
    <p style="margin:8px 0 0;font-size:12px;color:#8A8A88;text-align:center">Gratuit · Aucun engagement · Prêt en 30 secondes</p>
    ${divider()}
    ${paragraph(`On a construit Jestly pour que les créatifs puissent se concentrer sur ce qu'ils font de mieux — créer. Pas administrer.`)}
    ${paragraph(`Merci de faire partie de l'aventure.`)}
    <p style="margin:16px 0 0;font-size:14px;color:#111118;font-weight:600">Gabriel</p>
    <p style="margin:2px 0 0;font-size:12px;color:#8A8A88">Fondateur de Jestly</p>
  `);

  return {
    subject: "Jestly est live. Ton espace freelance t'attend.",
    html,
    text: `${data.first_name}, c'est officiel — Jestly est ouvert.\n\nTu fais partie des premiers à y accéder.\n\nCe que ça change :\n- 5h gagnées par semaine\n- Commandes, factures, clients — un seul endroit\n- Un site vitrine pro en 10 minutes\n- Pilote tout depuis un seul dashboard\n\nCréer mon compte gratuitement : https://jestly.fr/signup\n\nGratuit · Aucun engagement · Prêt en 30 secondes\n\nMerci de faire partie de l'aventure.\n\nGabriel — Fondateur de Jestly\n\n---\nJestly — Le cockpit du freelance moderne\njestly.fr`,
  };
}

// ─── Render dispatcher ───────────────────────────────────────

const renderers: Record<WaitlistTemplateKey, (data: TemplateData) => RenderedEmail> = {
  confirmation_waitlist: confirmationWaitlist,
  teasing_produit: teasingProduit,
  invitation_beta: invitationBeta,
  lancement_officiel: lancementOfficiel,
};

export function renderWaitlistTemplate(
  key: WaitlistTemplateKey,
  data: TemplateData
): RenderedEmail {
  return renderers[key](data);
}

// Preview HTML for admin UI (with placeholder name)
export function getTemplatePreviewHtml(key: WaitlistTemplateKey): string {
  const { html } = renderers[key]({ first_name: "Marie" });
  return html;
}

export function getTemplateSubject(key: WaitlistTemplateKey): string {
  const { subject } = renderers[key]({ first_name: "Prénom" });
  return subject;
}
