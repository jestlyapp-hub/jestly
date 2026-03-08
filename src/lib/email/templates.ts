import type { WaitlistTemplateKey } from "./types";

interface TemplateData {
  first_name: string;
}

interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
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
  const html = layout(`
    ${heading(`Bienvenue ${data.first_name} \u{1F44B}`)}
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
  const html = layout(`
    ${heading(`${data.first_name}, Jestly prend forme`)}
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
  const html = layout(`
    ${heading(`${data.first_name}, votre accès bêta est prêt`)}
    ${paragraph(`Vous faites partie des premiers inscrits sur la waitlist Jestly. Votre patience est récompensée : votre accès à la bêta privée est maintenant disponible.`)}
    ${paragraph(`Connectez-vous dès maintenant pour découvrir le cockpit freelance en avant-première. Votre retour nous aidera à construire l'outil parfait.`)}
    ${ctaButton("Accéder à la bêta", "https://jestly.fr/login", true)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#94A3B8">Cet accès est personnel et réservé aux membres de la waitlist. Si vous rencontrez un souci, répondez simplement à cet email.</span>`)}
  `);

  return {
    subject: "Ton accès bêta Jestly est prêt",
    html,
    text: `${data.first_name}, votre accès bêta est prêt.\n\nVous faites partie des premiers inscrits sur la waitlist Jestly. Votre accès à la bêta privée est maintenant disponible.\n\nConnectez-vous : https://jestly.fr/login\n\nVotre retour nous aidera à construire l'outil parfait.\n\n---\nJestly — Le cockpit tout-en-un pour freelances créatifs\nVous recevez cet email car vous vous êtes inscrit(e) à la waitlist Jestly sur jestly.fr.`,
  };
}

function lancementOfficiel(data: TemplateData): RenderedEmail {
  const html = layout(`
    ${heading(`${data.first_name}, Jestly est officiellement lancé`)}
    ${paragraph(`C'est le jour J. Après des mois de développement et de retours bêta, Jestly est maintenant ouvert à tous.`)}
    ${paragraph(`Un seul espace pour gérer vos commandes, votre workflow, vos factures, votre site vitrine, vos fichiers et votre agenda. Conçu pour les freelances créatifs qui veulent un outil à la hauteur de leur travail.`)}
    ${ctaButton("Découvrir Jestly", "https://jestly.fr/login", true)}
    ${divider()}
    ${paragraph(`<span style="font-size:13px;color:#94A3B8">Merci d'avoir cru en Jestly depuis le début. Vous êtes parmi ceux qui rendent ce projet possible.</span>`)}
  `);

  return {
    subject: "Jestly est officiellement lancé",
    html,
    text: `${data.first_name}, Jestly est officiellement lancé.\n\nC'est le jour J. Jestly est maintenant ouvert à tous.\n\nUn seul espace pour gérer commandes, workflow, factures, site vitrine, fichiers et agenda. Conçu pour les freelances créatifs.\n\nDécouvrir : https://jestly.fr/login\n\nMerci d'avoir cru en Jestly depuis le début.\n\n---\nJestly — Le cockpit tout-en-un pour freelances créatifs\nVous recevez cet email car vous vous êtes inscrit(e) à la waitlist Jestly sur jestly.fr.`,
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
