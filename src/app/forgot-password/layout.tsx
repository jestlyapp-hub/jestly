import { buildMetadata } from "@/lib/seo/build-metadata";

export const metadata = buildMetadata({
  title: "Mot de passe oublié — Jestly",
  description:
    "Réinitialisez votre mot de passe Jestly en quelques secondes. Recevez un lien sécurisé par email.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
