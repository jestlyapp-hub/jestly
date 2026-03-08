import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { isAdmin } from "@/lib/admin";
import { getTemplatePreviewHtml, getTemplateSubject } from "@/lib/email/templates";
import type { WaitlistTemplateKey } from "@/lib/email/types";

const VALID: WaitlistTemplateKey[] = [
  "confirmation_waitlist",
  "teasing_produit",
  "invitation_beta",
  "lancement_officiel",
];

export async function GET(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  if (!isAdmin(auth.user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const template = req.nextUrl.searchParams.get("template") as WaitlistTemplateKey | null;
  if (!template || !VALID.includes(template)) {
    return NextResponse.json({ error: "Template invalide" }, { status: 400 });
  }

  return NextResponse.json({
    subject: getTemplateSubject(template),
    html: getTemplatePreviewHtml(template),
  });
}
