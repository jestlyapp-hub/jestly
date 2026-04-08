import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Jestly — Le cockpit du freelance moderne";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background:
            "linear-gradient(135deg, #0F0F1A 0%, #1A1530 50%, #2D1B4E 100%)",
          color: "white",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 32,
            fontWeight: 600,
            color: "#A78BFA",
            letterSpacing: -0.5,
            marginBottom: 24,
          }}
        >
          Jestly
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: -2,
            marginBottom: 32,
            maxWidth: 1000,
          }}
        >
          Le cockpit tout-en-un du freelance moderne.
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#C4B5FD",
            lineHeight: 1.4,
            maxWidth: 900,
          }}
        >
          Site, CRM, facturation, agenda, commandes — un seul outil pour
          remplacer vos 10 abonnements.
        </div>
      </div>
    ),
    { ...size },
  );
}
