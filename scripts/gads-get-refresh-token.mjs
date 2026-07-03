#!/usr/bin/env node
/**
 * One-shot : génère le refresh token Google Ads via le flow OAuth loopback.
 *
 * Pré-requis (.env.local) : GOOGLE_ADS_CLIENT_ID + GOOGLE_ADS_CLIENT_SECRET
 * (ID client OAuth type « Application de bureau » — voir le guide).
 *
 * Le script démarre un serveur local, ouvre le navigateur, tu autorises avec
 * rasenyafx@gmail.com, et il imprime le refresh_token UNIQUEMENT en console
 * (aucun log, aucun fichier). Copie-le ensuite dans .env.local :
 *   GOOGLE_ADS_REFRESH_TOKEN=...
 *
 * Usage : node scripts/gads-get-refresh-token.mjs
 */
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import crypto from "node:crypto";
import { exec } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("="); if (eq < 0) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}

const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("✗ GOOGLE_ADS_CLIENT_ID / GOOGLE_ADS_CLIENT_SECRET manquants dans .env.local");
  console.error("  Crée d'abord l'ID client OAuth (type « Application de bureau ») dans Google Cloud Console.");
  process.exit(1);
}

const PORT = 53682;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const SCOPE = "https://www.googleapis.com/auth/adwords";
const state = crypto.randomBytes(16).toString("hex");

const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("access_type", "offline");
authUrl.searchParams.set("prompt", "consent");
authUrl.searchParams.set("state", state);

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  if (url.pathname !== "/callback") { res.writeHead(404); res.end(); return; }

  if (url.searchParams.get("state") !== state) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("État OAuth invalide — relance le script.");
    return;
  }
  const error = url.searchParams.get("error");
  if (error) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Autorisation refusée : ${error}`);
    console.error(`✗ Autorisation refusée : ${error}`);
    server.close();
    process.exit(1);
  }

  const code = url.searchParams.get("code");
  try {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
      }),
    });
    const json = await tokenRes.json();
    if (!tokenRes.ok || !json.refresh_token) {
      throw new Error(json.error_description ?? JSON.stringify(json).slice(0, 300));
    }

    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h2>✅ Autorisation réussie</h2><p>Retourne dans le terminal — tu peux fermer cet onglet.</p>");

    console.log("\n✅ Refresh token obtenu. Ajoute cette ligne dans .env.local :\n");
    console.log(`GOOGLE_ADS_REFRESH_TOKEN=${json.refresh_token}\n`);
    console.log("(et dans les variables d'environnement Vercel pour la prod)");
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    res.end(`Échange du code échoué : ${e.message}`);
    console.error(`✗ Échange du code échoué : ${e.message}`);
  } finally {
    server.close();
    setTimeout(() => process.exit(0), 100);
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log("→ Ouvre cette URL dans ton navigateur (compte rasenyafx@gmail.com) :\n");
  console.log(authUrl.toString());
  console.log("\n(ouverture automatique tentée…)");
  exec(`start "" "${authUrl.toString().replace(/&/g, "^&")}"`, () => {});
});
