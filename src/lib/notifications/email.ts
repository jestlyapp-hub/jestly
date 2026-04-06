/* ══════════════════════════════════════════════════════════════════════
   Notifications — Email
   Envoi d'emails de notification via Resend.
   Réutilise le pattern existant de send-waitlist-email.ts.
   ══════════════════════════════════════════════════════════════════════ */

import { Resend } from "resend";
import { NOTIFICATION_TYPES } from "./config";
import type { NotificationType } from "./types";

const FROM_EMAIL = "Jestly <hello@jestly.fr>";
const REPLY_TO = "hello@jestly.fr";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

/** Escape HTML */
function esc(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Layout email Jestly premium */
function layout(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jestly</title></head>
<body style="margin:0;padding:0;background:#f0eff5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0eff5;padding:40px 16px">
<tr><td align="center">
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin-bottom:24px">
  <tr><td align="center">
    <a href="https://jestly.fr" target="_blank" style="text-decoration:none">
      <img src="https://jestly.fr/logo-color.png" alt="Jestly" width="40" height="40" style="display:block;border-radius:10px;border:0">
    </a>
  </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06)">
  <tr><td style="padding:40px 36px">
    ${content}
  </td></tr>
  </table>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin-top:20px">
  <tr><td align="center" style="color:#999;font-size:11px;line-height:1.5">
    <a href="https://jestly.fr/parametres#notifications" style="color:#7C3AED;text-decoration:none">Gérer mes préférences</a>
    &nbsp;·&nbsp; <a href="https://jestly.fr" style="color:#999;text-decoration:none">jestly.fr</a>
  </td></tr>
  </table>
</td></tr>
</table>
</body>
</html>`;
}

interface SendNotificationEmailParams {
  to: string;
  firstName: string;
  type: NotificationType;
  title: string;
  message: string;
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * Envoie un email de notification.
 * Fire-and-forget — ne throw jamais.
 */
export async function sendNotificationEmail(params: SendNotificationEmailParams): Promise<{ success: boolean; error?: string }> {
  const resend = getResend();
  if (!resend) {
    console.warn("[notifications/email] RESEND_API_KEY non configuré");
    return { success: false, error: "Resend not configured" };
  }

  const config = NOTIFICATION_TYPES[params.type];
  const safeName = esc(params.firstName);
  const safeTitle = esc(params.title);
  const safeMessage = esc(params.message);

  const ctaHtml = params.ctaLabel && params.ctaHref
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:24px">
      <tr><td>
        <a href="https://jestly.fr${esc(params.ctaHref)}" target="_blank" style="display:inline-block;background:#7C3AED;color:#ffffff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none">
          ${esc(params.ctaLabel)}
        </a>
      </td></tr>
      </table>`
    : "";

  const html = layout(`
    <p style="margin:0 0 8px;font-size:15px;color:#191919;font-weight:600">Bonjour ${safeName},</p>
    <p style="margin:0 0 16px;font-size:20px;color:#191919;font-weight:700;line-height:1.3">${safeTitle}</p>
    <p style="margin:0;font-size:14px;color:#57534E;line-height:1.6">${safeMessage}</p>
    ${ctaHtml}
  `);

  const text = `Bonjour ${params.firstName},\n\n${params.title}\n\n${params.message}${params.ctaHref ? `\n\nhttps://jestly.fr${params.ctaHref}` : ""}`;

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: params.to,
      subject: `${config.label} — Jestly`,
      html,
      text,
    });

    if (error) {
      console.error("[notifications/email] Resend error:", error);
      return { success: false, error: JSON.stringify(error) };
    }

    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[notifications/email] Send failed:", msg);
    return { success: false, error: msg };
  }
}
