import type { GuideChapter } from "./guide.types";

// ═══════════════════════════════════════════════════════════════════
// ONBOARDING V3 — Flow officiel Jestly
//
// PHASE 0 : Création du site (si aucun site n'existe)
// PHASE 1 : Site / Éditeur / Blocs (comprendre la structure)
// PHASE 2 : Brief (créer + expliquer)
// PHASE 3 : Produit (créer + associer brief)
// PHASE 4 : Bloc de vente (ajouter + lier produit)
// PHASE 5 : Publier
// PHASE 6 : Commandes (explication + création manuelle)
// PHASE 7 : Clients (explication + création manuelle)
//
// RÈGLES :
// - start() choisit le bon chapitre selon accountState
// - Si aucun site : CHAPTERS[0] = create_site
// - Si site existe : skip create_site, commencer à CHAPTERS[1] = site
// - Missions adaptatives via custom validators
// - Aucune mission builder/bloc ne démarre sans site existant
// ═══════════════════════════════════════════════════════════════════

export const CHAPTERS: GuideChapter[] = [

  // ═══ 0. CRÉATION DU SITE ═══════════════════════════════════════════
  // Phase obligatoire si aucun site n'existe.
  // Skippé par start() si accountState.hasSite === true.
  {
    id: "create_site",
    title: "Créer votre site",
    description: "La base de tout le reste",
    icon: "✨",
    color: "#4F46E5",
    steps: [
      {
        id: "create_site_intro", chapterId: "create_site", kind: "intro",
        title: "Bienvenue sur Jestly !",
        body: "Nous allons créer votre système de vente en ligne en quelques étapes.\n\nD'abord, créons votre site. C'est la base de tout le reste : il accueillera vos offres, vos formulaires et vos pages.",
        why: "Voici les étapes :\n1. Créer votre site\n2. Comprendre le builder\n3. Créer un brief et un produit\n4. Afficher le produit sur le site\n5. Publier\n6. Gérer commandes et clients",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer mon site",
        placement: "center",
      },
      {
        id: "create_site_choose", chapterId: "create_site", kind: "action",
        title: "Choisissez votre point de départ",
        body: "Cliquez sur le template qui vous plaît.\nTout sera modifiable ensuite.",
        preActions: [
          { type: "navigate", route: "/site-web/nouveau" },
          { type: "delay", ms: 500 },
        ],
        requiredRoute: "/site-web/nouveau",
        placement: "center",
        // NON-BLOCKING: pas d'overlay sombre, coachmark compact en haut
        // L'utilisateur doit pouvoir cliquer librement sur les templates
        nonBlocking: true,
        // Valide dès que le site est créé (redirect vers /createur détecté)
        completeWhen: { type: "custom", key: "site_exists", pollMs: 1000, timeoutMs: 120000 },
      },
      {
        id: "create_site_done", chapterId: "create_site", kind: "recap", tone: "success",
        title: "Site créé !",
        body: "Votre site est prêt. Vous êtes maintenant dans l'éditeur.\nDécouvrons comment il fonctionne.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Découvrir l'éditeur",
        placement: "center",
      },
    ],
  },

  // ═══ 1. SITE / ÉDITEUR / AJOUT PREMIER BLOC ═════════════════════
  // Mission ACTIVE : l'utilisateur ajoute réellement un bloc, pas juste des tooltips.
  {
    id: "site",
    title: "Ajoutez votre premier bloc",
    description: "Découvrez l'éditeur en ajoutant un bloc",
    icon: "🌐",
    color: "#4F46E5",
    steps: [
      {
        id: "welcome", chapterId: "site", kind: "intro",
        title: "Bienvenue sur Jestly !",
        body: "Ce guide va vous montrer comment créer une offre complète et la vendre depuis votre site.\n\nCommençons par découvrir l'éditeur en ajoutant votre premier bloc.",
        why: "Votre site se construit bloc par bloc : texte, images, offres, témoignages, formulaires…",
        completeWhen: { type: "acknowledge" }, ctaLabel: "C'est parti",
        placement: "center",
      },
      {
        id: "site_add_block_cta", chapterId: "site", kind: "action",
        title: "Ajoutez un nouveau bloc",
        body: "Cliquez sur « + Ajouter un bloc » pour ouvrir la bibliothèque de sections disponibles.",
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="add-block-btn"]', timeout: 10000 },
        ],
        requiredRoute: "/createur",
        target: { selector: '[data-guide="add-block-btn"]', placement: "top" },
        completeWhen: { type: "click", selector: '[data-guide="add-block-btn"]' },
      },
      {
        id: "site_pick_block", chapterId: "site", kind: "action",
        title: "Choisissez un bloc",
        body: "Sélectionnez un bloc dans le catalogue pour l'ajouter à votre page.\nVous pouvez choisir n'importe lequel : texte, hero, contact, CTA…",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-catalog"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-catalog"]', timeout: 8000 },
        ],
        // Completes when a block is selected (catalog closes, block auto-selected)
        completeWhen: { type: "custom", key: "block_selected_in_builder", pollMs: 500, timeoutMs: 90000 },
      },
      {
        id: "site_block_added", chapterId: "site", kind: "show",
        title: "Bloc ajouté — modifiez-le",
        body: "Votre bloc est maintenant dans votre page.\nDans le panneau à droite, vous pouvez modifier son contenu, son style et ses réglages.\n\nChaque bloc fonctionne ainsi : ajout → sélection → modification.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-property-panel"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-property-panel"]', timeout: 5000 },
        ],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Passons au brief",
      },
    ],
  },

  // ═══ 2. BRIEF ════════════════════════════════════════════════════
  {
    id: "brief",
    title: "Créer un brief",
    description: "Le questionnaire envoyé au client",
    icon: "📋",
    color: "#F59E0B",
    steps: [
      {
        id: "brief_intro", chapterId: "brief", kind: "explain",
        title: "Le brief : récolter les infos client",
        body: "Un brief est un questionnaire envoyé automatiquement au client quand il commande.\n\nIl structure le besoin :\n• Quel projet ?\n• Quel style ?\n• Quelle deadline ?\n• Quels fichiers ?\n\nRésultat : vous recevez une commande complète, sans relance par email.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer un brief",
        placement: "center", educational: true,
      },
      {
        id: "brief_nav", chapterId: "brief", kind: "show",
        title: "La section Briefs",
        body: "Vos templates de briefs sont ici, en bas de la page Offres.\nChaque brief est réutilisable sur plusieurs produits.",
        preActions: [
          { type: "navigate", route: "/offres" },
          { type: "waitFor", selector: '[data-guide="briefs-section"]', timeout: 10000 },
          { type: "scrollTo", selector: '[data-guide="briefs-section"]' },
        ],
        requiredRoute: "/offres",
        target: { selector: '[data-guide="briefs-section"]', placement: "top" },
        completeWhen: { type: "acknowledge" }, ctaLabel: "Compris",
      },
      {
        id: "brief_click", chapterId: "brief", kind: "action",
        title: "Cliquez « Créer un brief »",
        body: "Le formulaire de création va s'ouvrir.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="new-brief-btn"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="new-brief-btn"]' }],
        completeWhen: { type: "click", selector: '[data-guide="new-brief-btn"]' },
      },
      {
        id: "brief_fill_and_submit", chapterId: "brief", kind: "action",
        title: "Nommez et créez votre brief",
        body: "Donnez un nom (ex : Brief Miniature YouTube), puis cliquez « Créer avec le template par défaut ».\n\nLe template inclut les champs essentiels : date souhaitée, description du besoin, fichiers à fournir.\nTout est personnalisable ensuite.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="brief-name-input"]', placement: "right" },
        preActions: [{ type: "waitFor", selector: '[data-guide="brief-name-input"]', timeout: 6000 }],
        completeWhen: { type: "click", selector: '[data-guide="brief-create-default"]' },
      },
      {
        id: "brief_done", chapterId: "brief", kind: "recap", tone: "success",
        title: "Brief créé !",
        body: "Votre brief est prêt. Passons à la création de votre produit.",
        requiredRoute: "/offres",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer le produit",
        placement: "center",
      },
    ],
  },

  // ═══ 3. PRODUIT + ASSOCIATION BRIEF ═══════════════════════════════
  {
    id: "product",
    title: "Créer un produit",
    description: "Votre offre + le brief associé",
    icon: "📦",
    color: "#10B981",
    steps: [
      {
        id: "product_intro", chapterId: "product", kind: "explain",
        title: "Le produit : ce que le client achète",
        body: "Un produit = votre prestation.\n\n• Service (ex : Logo, Miniature YouTube)\n• Pack (ex : Identité visuelle complète)\n• Digital (ex : Template, eBook)\n\nLe produit vend votre prestation.\nLe brief récupère les informations pour la réaliser.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Créer le produit",
        placement: "center", educational: true,
      },
      {
        id: "product_click_new", chapterId: "product", kind: "action",
        title: "Cliquez « Nouvelle offre »",
        body: "Ce bouton ouvre le formulaire de création.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="new-product-btn"]', placement: "bottom" },
        preActions: [
          { type: "scrollTo", selector: '[data-guide="new-product-btn"]' },
          { type: "waitFor", selector: '[data-guide="new-product-btn"]' },
        ],
        completeWhen: { type: "click", selector: '[data-guide="new-product-btn"]' },
      },
      {
        id: "product_fill_and_submit", chapterId: "product", kind: "action",
        title: "Remplissez et créez votre offre",
        body: "Donnez un nom (ex : Miniature YouTube Premium), un prix, puis cliquez « Créer ».\n\nTout sera modifiable ensuite.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-name-input"]', placement: "right" },
        preActions: [{ type: "waitFor", selector: '[data-guide="product-name-input"]', timeout: 6000 }],
        completeWhen: { type: "click", selector: '[data-guide="product-create-submit"]' },
      },
      {
        id: "product_created", chapterId: "product", kind: "explain",
        title: "Produit créé ! Associons le brief.",
        body: "Ouvrons votre produit pour y associer le brief.\nLe client recevra automatiquement le questionnaire à chaque commande.",
        requiredRoute: "/offres",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ouvrir le produit",
        placement: "center",
      },
      {
        id: "product_click_edit", chapterId: "product", kind: "action",
        title: "Cliquez « Éditer »",
        body: "Ce bouton ouvre la page de configuration du produit.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-edit-btn"]', placement: "bottom" },
        preActions: [
          { type: "scrollTo", selector: '[data-guide="product-edit-btn"]' },
          { type: "waitFor", selector: '[data-guide="product-edit-btn"]', timeout: 6000 },
        ],
        completeWhen: { type: "click", selector: '[data-guide="product-edit-btn"]' },
      },
      {
        id: "product_tab_brief", chapterId: "product", kind: "action",
        title: "Ouvrez l'onglet « Brief »",
        body: "C'est ici que vous associez le brief à votre produit.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-tab-brief"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="product-tab-brief"]', timeout: 8000 }],
        // Valide dès le clic sur l'onglet OU auto-complete si brief déjà lié
        completeWhen: { type: "custom", key: "brief_tab_or_linked", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_select_brief", chapterId: "product", kind: "show",
        title: "Sélectionnez votre brief",
        body: "Choisissez le brief créé précédemment dans la liste.\nLe client le recevra après chaque commande.",
        requiredRoute: "/offres",
        target: { selector: '[data-guide="product-add-brief-select"]', placement: "right" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="product-add-brief-select"]', timeout: 6000 },
          { type: "scrollTo", selector: '[data-guide="product-add-brief-select"]' },
        ],
        // ADAPTATIF : auto-complete si brief déjà lié
        completeWhen: { type: "custom", key: "brief_linked_to_product", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_save_brief", chapterId: "product", kind: "action",
        title: "Enregistrez l'association",
        body: "Cliquez « Enregistrer » pour lier le brief au produit.",
        target: { selector: '[data-guide="product-save-brief"]', placement: "top" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="product-save-brief"]' },
          { type: "scrollTo", selector: '[data-guide="product-save-brief"]' },
        ],
        // ADAPTATIF : auto-complete si brief déjà lié
        completeWhen: { type: "custom", key: "brief_linked_to_product", pollMs: 500, timeoutMs: 60000 },
      },
      {
        id: "product_done", chapterId: "product", kind: "recap", tone: "success",
        title: "Produit + Brief liés !",
        body: "Votre offre est prête avec son brief associé.\nAjoutons-la sur votre site.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Afficher sur le site",
        placement: "center",
      },
    ],
  },

  // ═══ 4. AJOUTER BLOC DE VENTE + PRODUIT (Mission: builder_add_product_sales_block)
  //
  // ADAPTIVE : si le bloc produit existe déjà, les étapes 2-4 s'auto-complètent
  // et l'utilisateur atterrit directement sur la sélection du produit.
  // ═══════════════════════════════════════════════════════════════════════════════
  {
    id: "builder",
    title: "Ajouter un bloc de vente",
    description: "Ajoutez un bloc produit puis sélectionnez votre offre",
    icon: "🧱",
    color: "#0EA5E9",
    steps: [
      // ── 1. INTRO PÉDAGOGIQUE ──────────────────────────────────────
      {
        id: "builder_intro", chapterId: "builder", kind: "explain",
        title: "Ajouter un bloc de vente produit",
        body: "Votre produit est créé, mais il n'est pas encore visible sur votre site.\n\nProduit = la donnée commerciale (nom, prix, description).\nBloc de vente = l'affichage sur la page.\n\nOn va ajouter un bloc de vente à votre site, puis y sélectionner le produit que vous venez de créer.",
        why: "Sans bloc de vente, votre produit existe dans Jestly mais n'apparaît pas sur votre site public. C'est le bloc qui fait le lien entre les deux.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ajouter le bloc",
        placement: "center", educational: true,
      },

      // ── 2. OUVRIR LA BIBLIOTHÈQUE DE BLOCS ────────────────────────
      // ADAPTATIF : auto-skip si un bloc produit existe déjà
      {
        id: "builder_open_library", chapterId: "builder", kind: "action",
        title: "Ouvrez la bibliothèque de blocs",
        body: "Cliquez sur « + Ajouter un bloc » pour ouvrir le catalogue de blocs disponibles.",
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="add-block-btn"]', timeout: 10000 },
        ],
        requiredRoute: "/createur",
        target: { selector: '[data-guide="add-block-btn"]', placement: "top" },
        // Auto-completes if: product block already exists OR library is open
        completeWhen: { type: "custom", key: "block_or_library_open", pollMs: 300, timeoutMs: 90000 },
      },

      // ── 3. CHOISIR LA CATÉGORIE « VENTE PRODUIT » ─────────────────
      // ADAPTATIF : auto-skip si un bloc produit existe déjà
      {
        id: "builder_select_vente", chapterId: "builder", kind: "action",
        title: "Catégorie « Vente produit »",
        body: "Cette catégorie contient les blocs pour vendre vos services et produits.\nChoisissez-la pour voir les blocs de vente disponibles.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-cat-vente"]', placement: "right" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-cat-vente"]', timeout: 8000 },
        ],
        // Auto-completes if: product block already exists OR catalog is showing
        completeWhen: { type: "custom", key: "block_or_vente_selected", pollMs: 300, timeoutMs: 60000 },
      },

      // ── 4. CHOISIR UN BLOC DE VENTE (GRILLE PRODUITS) ─────────────
      // ADAPTATIF : auto-skip si un bloc produit existe déjà
      {
        id: "builder_pick_block", chapterId: "builder", kind: "action",
        title: "Choisissez « Grille Produits »",
        body: "Sélectionnez un bloc de vente comme :\n• Grille Produits\n• Service cards\n• Hero Produit\n\nCe bloc affichera votre offre sur la page.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-catalog"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="block-catalog"]', timeout: 8000 },
        ],
        // Completes when ANY product block exists in the page
        completeWhen: { type: "custom", key: "has_product_block", pollMs: 500, timeoutMs: 60000 },
      },

      // ── 5. BLOC AJOUTÉ — OUVRIR LE PANNEAU CONTENU ────────────────
      {
        id: "builder_block_ready", chapterId: "builder", kind: "show",
        title: "Bloc ajouté — configurons-le",
        body: "Votre bloc de vente est maintenant dans votre page.\nDans le panneau à droite, vous allez choisir quels produits ce bloc doit afficher.\n\nC'est ici que le lien se fait entre votre produit et votre site.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="block-property-panel"]', placement: "left" },
        preActions: [
          // GuideBridge will auto-select the product block via events
          { type: "delay", ms: 400 },
          { type: "waitFor", selector: '[data-guide="block-property-panel"]', timeout: 5000 },
        ],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Ajouter le produit",
      },

      // ── 6. SÉLECTIONNER LE PRODUIT — LA MISSION CLÉ ───────────────
      // NON-BLOQUANT : la card ne doit pas masquer la liste produit
      // Le highlight cible le produit cliquable, pas le champ recherche
      {
        id: "builder_select_product", chapterId: "builder", kind: "action",
        title: "Ajoutez votre produit au bloc",
        body: "Dans la liste à droite, cliquez sur le produit que vous avez créé.\nUne fois sélectionné, il apparaîtra automatiquement sur votre site.",
        why: "S'il n'apparaît pas, utilisez le champ de recherche juste au-dessus.",
        requiredRoute: "/createur",
        // Target: product option first, fallback to search input
        // The overlay will try product-option first, then products-search
        target: { selector: '[data-guide="products-search"]', placement: "left" },
        preActions: [
          { type: "waitFor", selector: '[data-guide="products-search"]', timeout: 15000 },
        ],
        // NON-BLOCKING: compact card, doesn't hide the product list
        nonBlocking: true,
        // VALIDATION MÉTIER RÉELLE : hasProductBlock && productsDisplayed >= 1
        completeWhen: { type: "custom", key: "product_displayed", pollMs: 1000, timeoutMs: 120000 },
      },

      // ── 7. SUCCÈS — PRODUIT VISIBLE SUR LE SITE ───────────────────
      {
        id: "builder_product_visible", chapterId: "builder", kind: "recap", tone: "success",
        title: "Produit ajouté avec succès !",
        body: "Votre offre est maintenant visible sur votre site.\nLes visiteurs pourront la voir et la commander directement.\n\nPublions le site pour le rendre accessible au monde entier.",
        requiredRoute: "/createur",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Publier le site",
        placement: "center",
      },
    ],
  },

  // ═══ 5. PUBLIER LE SITE (Mission: publish-site) ════════════════════
  {
    id: "publish",
    title: "Publier votre site",
    description: "Votre site est prêt, publions-le",
    icon: "🚀",
    color: "#8B5CF6",
    steps: [
      {
        id: "pub_intro", chapterId: "publish", kind: "explain",
        title: "Publier votre site",
        body: "Votre site est prêt avec votre offre.\nPublions-le pour qu'il soit accessible à vos clients.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Publier maintenant",
        placement: "center",
      },
      {
        id: "pub_click", chapterId: "publish", kind: "action",
        title: "Cliquez ici pour publier",
        body: "Cliquez sur « Publier » pour mettre votre site en ligne.\nVotre produit sera commandable avec le brief associé.",
        requiredRoute: "/createur",
        target: { selector: '[data-guide="publish-site"]', placement: "bottom" },
        preActions: [
          { type: "navigate", route: "/createur" },
          { type: "waitFor", selector: '[data-guide="publish-site"]', timeout: 10000 },
        ],
        // VALIDATION RÉELLE : détecte que le site est publié (bouton passe à "Publié !")
        completeWhen: { type: "custom", key: "site_published", pollMs: 500, timeoutMs: 30000 },
      },
      {
        id: "pub_done", chapterId: "publish", kind: "recap", tone: "success",
        title: "Votre site est en ligne !",
        body: "Votre site est accessible publiquement.\nVotre produit est prêt à être commandé, avec le brief intégré.\n\nVoyons où arrivent les commandes.",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Voir les commandes",
        placement: "center",
      },
    ],
  },

  // ═══ 6. COMMANDES ════════════════════════════════════════════════
  {
    id: "orders",
    title: "Vos commandes",
    description: "Où arrivent toutes les commandes",
    icon: "🛒",
    color: "#EF4444",
    steps: [
      {
        id: "orders_intro", chapterId: "orders", kind: "show",
        title: "Toutes vos commandes arrivent ici",
        body: "Chaque commande passée depuis votre site arrive automatiquement ici.\n\nVous pouvez suivre, organiser et livrer vos projets depuis cette page.",
        preActions: [
          { type: "navigate", route: "/commandes" },
          { type: "waitFor", selector: '[data-guide="new-order-btn"]', timeout: 8000 },
        ],
        requiredRoute: "/commandes",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Compris",
        placement: "center",
      },
      {
        id: "orders_manual", chapterId: "orders", kind: "show",
        title: "Créez aussi des commandes manuellement",
        body: "Vous pouvez créer une commande même sans passer par le site.\n\nPratique pour les clients qui vous contactent par email, téléphone ou réseaux sociaux.",
        requiredRoute: "/commandes",
        target: { selector: '[data-guide="new-order-btn"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="new-order-btn"]' }],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Et les clients ?",
      },
    ],
  },

  // ═══ 7. CLIENTS ══════════════════════════════════════════════════
  {
    id: "clients",
    title: "Vos clients",
    description: "Votre base client centralisée",
    icon: "👥",
    color: "#EC4899",
    steps: [
      {
        id: "clients_intro", chapterId: "clients", kind: "show",
        title: "Chaque client arrive ici automatiquement",
        body: "Quand un client passe commande, il est ajouté automatiquement à votre base.\n\nVous pouvez centraliser tous vos contacts ici.",
        preActions: [
          { type: "navigate", route: "/clients" },
          { type: "waitFor", selector: '[data-guide="new-client-btn"]', timeout: 8000 },
        ],
        requiredRoute: "/clients",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Compris",
        placement: "center",
      },
      {
        id: "clients_manual", chapterId: "clients", kind: "show",
        title: "Ajoutez aussi des clients manuellement",
        body: "Vous pouvez ajouter un client même sans commande.\n\nPratique pour importer vos contacts ou noter un prospect.",
        requiredRoute: "/clients",
        target: { selector: '[data-guide="new-client-btn"]', placement: "bottom" },
        preActions: [{ type: "waitFor", selector: '[data-guide="new-client-btn"]' }],
        completeWhen: { type: "acknowledge" }, ctaLabel: "Terminer le guide",
      },
      {
        id: "final", chapterId: "clients", kind: "recap", tone: "success",
        title: "Votre système est prêt !",
        body: "✅ Votre site affiche votre offre\n📋 Votre brief structure les demandes clients\n🛒 Vos commandes arrivent dans Commandes\n👥 Vos clients arrivent dans Clients\n\nTout est connecté. Bonne continuation sur Jestly !",
        completeWhen: { type: "acknowledge" }, ctaLabel: "Commencer à utiliser Jestly",
        placement: "center",
      },
    ],
  },
];
