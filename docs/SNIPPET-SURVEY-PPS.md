# Snippet — Survey post-achat (« Comment avez-vous connu la boutique ? »)

Un seul collage, comme le pixel. Le survey s'affiche sur la **page de statut
de commande** (celle que le client voit juste après le paiement) et envoie la
réponse à Jestly. La réponse ne sert qu'aux commandes que ni le pixel, ni
Shopify, ni l'attribution manuelle n'ont résolues (niveau 4 de la hiérarchie).

## Installation (L'Horloge Murale)

Shopify Admin → **Paramètres → Paiement (Checkout)** → section
**Scripts supplémentaires / Additional scripts** (page de statut de commande)
→ coller le bloc ci-dessous → Enregistrer.

> Si ton plan Shopify n'affiche pas la zone « Scripts supplémentaires »
> (elle disparaît avec Checkout Extensibility sur certains plans), dis-le à
> Claude : la voie de repli est une checkout UI extension, plus lourde à
> installer mais équivalente.

Multi-boutiques : remplacer la valeur de `pixelId` par le pixel_id de la
boutique (Mignou aura le sien via `scripts/pixel-register-shop.mjs`).

```html
<div id="jestly-pps" style="margin:16px 0;padding:16px;border:1px solid #d9d9d9;border-radius:8px;font-family:inherit">
  <p style="font-weight:600;margin:0 0 10px">Comment avez-vous connu L'Horloge Murale ?</p>
  <div id="jestly-pps-options" style="display:flex;flex-wrap:wrap;gap:8px"></div>
</div>
<script>
(function () {
  var pixelId = "97f155e4-4286-4c2d-932f-e935f6205a0b"; // pixel_id L'Horloge Murale
  var endpoint = "https://jestly.fr/api/pixel/pps";
  var orderId = "{{ order_id }}" || (window.Shopify && window.Shopify.checkout && window.Shopify.checkout.order_id) || "";
  if (!orderId) return;

  var box = document.getElementById("jestly-pps");
  var wrap = document.getElementById("jestly-pps-options");
  var storageKey = "jestly_pps_" + orderId;
  try { if (window.localStorage.getItem(storageKey)) { box.style.display = "none"; return; } } catch (e) {}

  var options = [
    ["google", "Google"],
    ["pinterest", "Pinterest"],
    ["instagram_tiktok", "Instagram / TikTok"],
    ["word_of_mouth", "Bouche-à-oreille"],
    ["other", "Autre"]
  ];
  options.forEach(function (opt) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = opt[1];
    btn.style.cssText = "padding:8px 14px;border:1px solid #c9c9c9;border-radius:6px;background:#fff;cursor:pointer";
    btn.onclick = function () {
      var body = JSON.stringify({ pixel_id: pixelId, order_id: String(orderId), answer: opt[0] });
      try {
        if (!(navigator.sendBeacon && navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain" })))) {
          fetch(endpoint, { method: "POST", body: body, keepalive: true, headers: { "Content-Type": "text/plain" } });
        }
      } catch (e) {}
      try { window.localStorage.setItem(storageKey, opt[0]); } catch (e) {}
      box.innerHTML = "<p style='margin:0;font-weight:600'>Merci pour votre réponse 💜</p>";
    };
    wrap.appendChild(btn);
  });
})();
</script>
```

## Notes

- Une seule réponse par commande : la **première fait foi** (doublons ignorés
  côté serveur, `UNIQUE(shop_id, shopify_order_id)`).
- La réponse « déclaré client » n'est **jamais** prioritaire sur le pixel,
  le natif Shopify ou l'attribution manuelle.
- Les réponses apparaissent dans l'Attribution Board (bloc survey : répartition,
  taux de réponse, CA récupéré) et dans le bandeau qualité de la Vue d'ensemble.
