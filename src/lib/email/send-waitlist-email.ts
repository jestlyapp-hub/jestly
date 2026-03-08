import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { renderWaitlistTemplate } from "./templates";
import type { WaitlistTemplateKey } from "./types";

const FROM_EMAIL = "Jestly <hello@jestly.fr>";
const REPLY_TO = "hello@jestly.fr";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

interface Recipient {
  email: string;
  first_name: string;
  waitlist_id?: string;
}

interface SendResult {
  success: boolean;
  error?: string;
}

/**
 * Send a single waitlist email and log it to the database.
 */
export async function sendWaitlistEmail(
  recipient: Recipient,
  templateKey: WaitlistTemplateKey,
  sentBy: string
): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not configured, skipping send");
    return { success: false, error: "Resend not configured" };
  }

  const supabase = createAdminClient();
  const rendered = renderWaitlistTemplate(templateKey, {
    first_name: recipient.first_name,
  });

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      replyTo: REPLY_TO,
      to: recipient.email,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });

    const status = error ? "failed" : "sent";
    const errorMessage = error ? JSON.stringify(error) : null;

    // Log to database
    await (supabase.from("waitlist_email_logs") as ReturnType<typeof supabase.from>)
      .insert({
        waitlist_id: recipient.waitlist_id || null,
        recipient_email: recipient.email,
        template_key: templateKey,
        sent_by: sentBy,
        status,
        error_message: errorMessage,
      });

    if (error) {
      console.error("[email] Resend error:", error);
      return { success: false, error: errorMessage ?? "Unknown error" };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("[email] Send failed:", errorMessage);

    // Log failure
    await (supabase.from("waitlist_email_logs") as ReturnType<typeof supabase.from>)
      .insert({
        waitlist_id: recipient.waitlist_id || null,
        recipient_email: recipient.email,
        template_key: templateKey,
        sent_by: sentBy,
        status: "failed",
        error_message: errorMessage,
      });

    return { success: false, error: errorMessage };
  }
}

/**
 * Send confirmation email after waitlist signup (fire-and-forget).
 */
export async function sendWaitlistConfirmation(
  email: string,
  firstName: string,
  waitlistId?: string
): Promise<void> {
  await sendWaitlistEmail(
    { email, first_name: firstName, waitlist_id: waitlistId },
    "confirmation_waitlist",
    "system"
  );
}
