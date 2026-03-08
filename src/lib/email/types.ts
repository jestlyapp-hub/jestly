export type WaitlistTemplateKey =
  | "confirmation_waitlist"
  | "teasing_produit"
  | "invitation_beta"
  | "lancement_officiel";

export const MANUAL_TEMPLATES: {
  key: WaitlistTemplateKey;
  label: string;
  description: string;
}[] = [
  {
    key: "teasing_produit",
    label: "Teasing produit",
    description: "Maintenir l'intérêt et teaser le cockpit freelance",
  },
  {
    key: "invitation_beta",
    label: "Invitation bêta",
    description: "Inviter à rejoindre la bêta avec accès prioritaire",
  },
  {
    key: "lancement_officiel",
    label: "Lancement officiel",
    description: "Annoncer l'ouverture officielle de Jestly",
  },
];

export interface SendEmailPayload {
  template: WaitlistTemplateKey;
  audience: "selected" | "filtered" | "all";
  selectedIds?: string[];
  filters?: {
    status?: string;
    job_type?: string;
    search?: string;
  };
}

export interface SendEmailResult {
  total: number;
  sent: number;
  failed: number;
  errors: string[];
}
