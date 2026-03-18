import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/api-auth";
import { getTemplate } from "@/lib/site-templates";

/* eslint-disable @typescript-eslint/no-explicit-any */

// POST /api/sites/from-template — create a site from a template definition
export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (auth.error) return auth.error;
  const { user, supabase } = auth;

  let body: { templateId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }

  const templateId = body.templateId;

  // "blank" = page vierge (no template)
  const isBlank = !templateId || templateId === "blank";
  const template = isBlank ? null : getTemplate(templateId);

  if (!isBlank && !template) {
    return NextResponse.json({ error: "Template introuvable." }, { status: 404 });
  }

  // Generate unique slug
  const slug = `site-${Date.now().toString(36)}`;

  // 1. Insert site
  const defaultTheme = { primaryColor: "#4F46E5", fontFamily: "Inter", borderRadius: "rounded" as const, shadow: "md" as const };

  const sitePayload: Record<string, unknown> = {
    owner_id: user.id,
    slug,
    name: template ? template.name : "Mon site",
    status: "draft",
    settings: template
      ? { name: template.name, description: template.description, maintenanceMode: false, socials: {} }
      : { name: "Mon site", description: "", maintenanceMode: false, socials: {} },
    theme: template?.theme ?? defaultTheme,
    seo: { globalTitle: template?.name ?? "Mon site", globalDescription: template?.description ?? "" },
    nav: template?.nav ?? null,
    footer: template?.footer ?? null,
    design: template?.design ?? null,
  };

  const { data: newSite, error: siteErr } = await (supabase.from("sites") as any)
    .insert(sitePayload)
    .select("id")
    .single();

  if (siteErr || !newSite) {
    console.error("[from-template] site insert error:", siteErr);
    return NextResponse.json({ error: siteErr?.message || "Erreur création site." }, { status: 500 });
  }

  const siteId = newSite.id;

  // ── BLANK template: create a minimal home page ──
  if (isBlank) {
    const { data: homePage } = await (supabase.from("site_pages") as any)
      .insert({
        site_id: siteId,
        title: "Accueil",
        slug: "/",
        is_home: true,
        sort_order: 0,
        status: "draft",
      })
      .select("id")
      .single();

    if (homePage) {
      // Insert a default hero block
      await (supabase.from("site_blocks") as any).insert({
        page_id: homePage.id,
        type: "hero",
        sort_order: 0,
        content: {
          title: "Bienvenue sur votre site",
          subtitle: "Commencez à ajouter des blocs pour construire votre page.",
          ctaLabel: "Découvrir",
          ctaLink: "",
        },
        style: { paddingTop: 80, paddingBottom: 80, containerWidth: "boxed" },
        settings: {},
        visible: true,
      });

      // Set minimal nav
      await (supabase.from("sites") as any)
        .update({
          nav: {
            links: [{ label: "Accueil", pageId: homePage.id }],
            showCta: false,
            ctaLabel: "",
          },
          footer: {
            links: [{ label: "Accueil", pageId: homePage.id }],
            showSocials: false,
            copyright: "Tous droits réservés.",
          },
        })
        .eq("id", siteId);
    }

    return NextResponse.json({ siteId });
  }

  // ── TEMPLATE: full pages + blocks + brief ──

  // 2. Insert pages
  const pageRows = template!.pages.map((p, i) => ({
    site_id: siteId,
    title: p.title,
    slug: p.slug,
    is_home: p.is_home,
    sort_order: i,
    status: "draft",
  }));

  const { data: insertedPages, error: pageErr } = await (supabase.from("site_pages") as any)
    .insert(pageRows)
    .select("id");

  if (pageErr || !insertedPages) {
    console.error("[from-template] pages insert error:", pageErr);
    return NextResponse.json({ error: pageErr?.message || "Erreur insertion pages." }, { status: 500 });
  }

  // 3. Insert blocks for each page
  const blockRows: any[] = [];
  for (let i = 0; i < template!.pages.length; i++) {
    const pageId = insertedPages[i].id;
    for (let j = 0; j < template!.pages[i].blocks.length; j++) {
      const b = template!.pages[i].blocks[j];
      blockRows.push({
        page_id: pageId,
        type: b.type,
        sort_order: j,
        content: b.content,
        style: b.style,
        settings: b.settings,
        visible: b.visible,
      });
    }
  }

  if (blockRows.length > 0) {
    const { error: blockErr } = await (supabase.from("site_blocks") as any)
      .insert(blockRows);

    if (blockErr) {
      console.error("[from-template] blocks insert error:", blockErr);
      return NextResponse.json({ error: blockErr.message, step: "blocks_insert" }, { status: 500 });
    }
  }

  // 4. Update nav links with real page IDs
  const navLinks = template!.nav.links.map((link) => {
    const pageIndex = template!.pages.findIndex((p) => p.title === link.label);
    return pageIndex >= 0 ? { ...link, pageId: insertedPages[pageIndex].id } : link;
  });
  const footerLinks = template!.footer.links.map((link) => {
    const pageIndex = template!.pages.findIndex((p) => p.title === link.label);
    return pageIndex >= 0 ? { ...link, pageId: insertedPages[pageIndex].id } : link;
  });

  // Find Commander page for CTA link
  const commanderIndex = template!.pages.findIndex((p) => p.slug === "/commander");
  const contactIndex = template!.pages.findIndex((p) => p.slug === "/contact");
  const ctaPageIndex = commanderIndex >= 0 ? commanderIndex : contactIndex;

  await (supabase.from("sites") as any)
    .update({
      nav: {
        ...template!.nav,
        links: navLinks,
        ctaLink: ctaPageIndex >= 0
          ? { type: "internal_page", value: insertedPages[ctaPageIndex].id }
          : template!.nav.ctaLink,
      },
      footer: { ...template!.footer, links: footerLinks },
    })
    .eq("id", siteId);

  // 5. Create brief template in DB if the template defines one
  if (template!.brief) {
    const briefDef = template!.brief;
    const { data: briefTemplate } = await (supabase.from("brief_templates") as any)
      .insert({
        owner_id: user.id,
        name: briefDef.name,
        description: briefDef.description,
        version: 1,
        schema: briefDef.fields,
      })
      .select("id")
      .single();

    if (briefTemplate) {
      // Brief is created — user can later link it to products via the brief builder.
      // For now, store the brief_template_id reference so the contact forms know about it.
      // We'll inject it into the contact-form blocks that have createOrder=true
      const contactPageIndex = template!.pages.findIndex((p) => p.slug === "/contact");
      if (contactPageIndex >= 0) {
        const contactPageId = insertedPages[contactPageIndex].id;

        // Find contact-form blocks on the contact page and update their briefTemplateId
        const { data: contactBlocks } = await (supabase.from("site_blocks") as any)
          .select("id, content")
          .eq("page_id", contactPageId)
          .eq("type", "contact-form");

        if (contactBlocks) {
          for (const block of contactBlocks) {
            if (block.content?.createOrder) {
              await (supabase.from("site_blocks") as any)
                .update({ content: { ...block.content, briefTemplateId: briefTemplate.id } })
                .eq("id", block.id);
            }
          }
        }
      }
    }
  }

  return NextResponse.json({ siteId });
}
