/**
 * Post-Purchase Survey — schéma du payload public et mapping réponse → canal.
 * La réponse déclarée est le niveau 4 de la hiérarchie d'attribution :
 * jamais prioritaire sur pixel / natif Shopify / manuel.
 */
import { z } from "zod";

export const PPS_ANSWERS = ["google", "pinterest", "instagram_tiktok", "word_of_mouth", "other"] as const;
export type PpsAnswer = (typeof PPS_ANSWERS)[number];

export const PpsPayloadSchema = z.object({
  pixel_id: z.string().uuid(),
  order_id: z.string().regex(/^\d{1,20}$/, "ID de commande Shopify attendu (numérique)"),
  answer: z.enum(PPS_ANSWERS),
});

export const PPS_ANSWER_LABELS: Record<PpsAnswer, string> = {
  google: "Google",
  pinterest: "Pinterest",
  instagram_tiktok: "Instagram / TikTok",
  word_of_mouth: "Bouche-à-oreille",
  other: "Autre",
};

/** Canal d'attribution correspondant à une réponse déclarée. */
export function ppsAnswerToChannel(answer: PpsAnswer): "google_ads" | "pinterest" | "other" {
  if (answer === "google") return "google_ads";
  if (answer === "pinterest") return "pinterest";
  return "other";
}
