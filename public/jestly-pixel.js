/**
 * Pixel first-party Jestly — MVP usage perso (LHM + Mignou).
 *
 * Capte à l'arrivée : gclid/gbraid/wbraid, utm_*, referrer, landing page.
 * Pose un identifiant first-party (_jestly_sid, ~90 jours, cookie + miroir
 * localStorage) et envoie l'arrivée à l'endpoint de collecte Jestly.
 *
 * CONSENT-AWARE (propreté des données) :
 *  - si l'API Shopify Customer Privacy est présente, on n'écrit RIEN et on
 *    n'envoie RIEN tant que le consentement analytics/marketing n'est pas
 *    accordé (on écoute la réponse à la bannière) ; refus → la vente reste
 *    ghost, comportement voulu ;
 *  - si aucune plateforme de consentement n'existe sur la boutique, il n'y a
 *    aucun refus exprimé → le pixel fonctionne.
 *
 * Installation (thème Shopify, avant </head>) :
 *   <script src="https://jestly.fr/jestly-pixel.js" data-pixel-id="VOTRE_PIXEL_ID" defer></script>
 * Ou init manuelle : window.JestlyPixel.init({ pixelId: "...", endpoint: "..." })
 */
(function () {
  "use strict";

  var COOKIE_NAME = "_jestly_sid";
  var COOKIE_DAYS = 90;
  var DEFAULT_ENDPOINT = "https://jestly.fr/api/pixel/collect";

  // ── Consentement (Shopify Customer Privacy API) ────────────────
  // "granted" | "denied" | "pending" | "no_api"
  function consentState() {
    var cp = window.Shopify && window.Shopify.customerPrivacy;
    if (!cp) return "no_api";
    try {
      var analytics = typeof cp.analyticsProcessingAllowed === "function" ? cp.analyticsProcessingAllowed() : null;
      var marketing = typeof cp.marketingAllowed === "function" ? cp.marketingAllowed() : null;
      if (analytics === true || marketing === true) return "granted";
      if (typeof cp.currentVisitorConsent === "function") {
        var c = cp.currentVisitorConsent() || {};
        var noAnswer = function (v) { return v === "" || v === undefined || v === null; };
        if (noAnswer(c.analytics) && noAnswer(c.marketing)) return "pending";
        if (c.analytics === "yes" || c.marketing === "yes") return "granted";
        return "denied";
      }
      if (analytics === false && marketing === false) return "denied";
      return "pending";
    } catch (e) {
      return "no_api";
    }
  }

  // ── Session first-party ─────────────────────────────────────────
  function readCookie(name) {
    var m = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return m ? decodeURIComponent(m[1]) : null;
  }

  function writeCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = name + "=" + encodeURIComponent(value) +
      "; expires=" + expires + "; path=/; SameSite=Lax" +
      (location.protocol === "https:" ? "; Secure" : "");
  }

  function uuid() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }

  function getOrCreateSession() {
    var sid = readCookie(COOKIE_NAME);
    var isNew = false;
    try { sid = sid || window.localStorage.getItem(COOKIE_NAME); } catch (e) { /* localStorage bloqué */ }
    if (!sid) { sid = uuid(); isNew = true; }
    // Rafraîchit la durée de vie à chaque visite consentie.
    writeCookie(COOKIE_NAME, sid, COOKIE_DAYS);
    try { window.localStorage.setItem(COOKIE_NAME, sid); } catch (e) { /* ignore */ }
    return { sid: sid, isNew: isNew };
  }

  // ── Signaux d'attribution ───────────────────────────────────────
  var PARAM_KEYS = ["gclid", "gbraid", "wbraid", "utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

  function collectParams() {
    var out = {};
    var found = false;
    try {
      var qs = new URLSearchParams(location.search);
      for (var i = 0; i < PARAM_KEYS.length; i++) {
        var v = qs.get(PARAM_KEYS[i]);
        if (v) { out[PARAM_KEYS[i]] = v.slice(0, 500); found = true; }
      }
    } catch (e) { /* URLSearchParams absent : très vieux navigateur */ }
    return { params: out, found: found };
  }

  function externalReferrer() {
    var r = document.referrer || "";
    if (!r) return null;
    try {
      if (new URL(r).host === location.host) return null;
    } catch (e) { return null; }
    return r.slice(0, 2000);
  }

  // ── Envoi ────────────────────────────────────────────────────────
  function send(endpoint, payload) {
    var body = JSON.stringify(payload);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" }))) return;
    } catch (e) { /* fallback fetch */ }
    try {
      fetch(endpoint, { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "text/plain" } });
    } catch (e) { /* réseau indisponible : tant pis, pas de retry */ }
  }

  function run(config) {
    if (navigator.webdriver) return; // bots évidents
    var session = getOrCreateSession();
    var collected = collectParams();
    var referrer = externalReferrer();

    // On envoie : nouvelle session (établit le first touch, même "direct"),
    // ou nouvelle arrivée porteuse de signaux (utm/gclid/referrer externe).
    var hasSignals = collected.found || Boolean(referrer);
    if (!session.isNew && !hasSignals) return;

    // Dédup dans l'onglet : même combinaison déjà envoyée → skip.
    var dedupKey = session.sid + "|" + location.search + "|" + (referrer || "");
    try {
      if (window.sessionStorage.getItem("_jestly_px_sent") === dedupKey) return;
      window.sessionStorage.setItem("_jestly_px_sent", dedupKey);
    } catch (e) { /* ignore */ }

    send(config.endpoint, {
      pixel_id: config.pixelId,
      session_id: session.sid,
      shop: location.hostname,
      landing: location.href.slice(0, 2000),
      referrer: referrer,
      params: collected.params,
      ts: Date.now(),
    });
  }

  function start(config) {
    if (!config || !config.pixelId) return;
    config.endpoint = config.endpoint || DEFAULT_ENDPOINT;

    var state = consentState();
    if (state === "granted" || state === "no_api") {
      run(config);
    } else if (state === "pending") {
      // Rien n'est posé ni envoyé tant que la bannière n'a pas de réponse.
      document.addEventListener("visitorConsentCollected", function () {
        if (consentState() === "granted") run(config);
      });
    }
    // state === "denied" → rien : la vente restera ghost, données propres.
  }

  // Init auto depuis la balise script, ou manuelle via window.JestlyPixel.init.
  window.JestlyPixel = { init: start };
  var tag = document.currentScript;
  if (tag && tag.getAttribute("data-pixel-id")) {
    start({
      pixelId: tag.getAttribute("data-pixel-id"),
      endpoint: tag.getAttribute("data-endpoint") || undefined,
    });
  }
})();
