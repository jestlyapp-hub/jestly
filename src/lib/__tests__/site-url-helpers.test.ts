import { describe, it, expect } from "vitest";
import {
  isSitePublished,
  canOpenPublicSite,
  getSitePublicUrl,
  getSiteDisplayUrl,
  getSitePreviewUrl,
  getSiteEditorUrl,
  getSiteManageUrl,
  type SiteUrlInput,
} from "../site-url-helpers";

/* ── Fixtures ── */

const draftWithSlug: SiteUrlInput = {
  id: "uuid-123",
  slug: "site-mnepq3qz",
  status: "draft",
  custom_domain: null,
};

const draftWithoutSlug: SiteUrlInput = {
  id: "uuid-456",
  slug: "",
  status: "draft",
  custom_domain: null,
};

const publishedWithSlug: SiteUrlInput = {
  id: "uuid-789",
  slug: "mon-portfolio",
  status: "published",
  custom_domain: null,
};

const publishedWithCustomDomain: SiteUrlInput = {
  id: "uuid-abc",
  slug: "mon-portfolio",
  status: "published",
  custom_domain: "portfolio.example.com",
};

const draftWithCustomDomain: SiteUrlInput = {
  id: "uuid-def",
  slug: "mon-site",
  status: "draft",
  custom_domain: "draft.example.com",
};

const publishedWithoutSlug: SiteUrlInput = {
  id: "uuid-ghi",
  slug: "",
  status: "published",
  custom_domain: null,
};

/* ── isSitePublished ── */

describe("isSitePublished", () => {
  it("retourne false pour un brouillon", () => {
    expect(isSitePublished(draftWithSlug)).toBe(false);
  });

  it("retourne true pour un site publié", () => {
    expect(isSitePublished(publishedWithSlug)).toBe(true);
  });
});

/* ── canOpenPublicSite ── */

describe("canOpenPublicSite", () => {
  it("retourne false pour un brouillon même avec slug", () => {
    expect(canOpenPublicSite(draftWithSlug)).toBe(false);
  });

  it("retourne false pour un brouillon sans slug", () => {
    expect(canOpenPublicSite(draftWithoutSlug)).toBe(false);
  });

  it("retourne true pour un site publié avec slug", () => {
    expect(canOpenPublicSite(publishedWithSlug)).toBe(true);
  });

  it("retourne false pour un site publié sans slug", () => {
    expect(canOpenPublicSite(publishedWithoutSlug)).toBe(false);
  });
});

/* ── getSitePublicUrl ── */

describe("getSitePublicUrl", () => {
  it("retourne null pour un brouillon avec slug", () => {
    expect(getSitePublicUrl(draftWithSlug)).toBeNull();
  });

  it("retourne null pour un brouillon sans slug", () => {
    expect(getSitePublicUrl(draftWithoutSlug)).toBeNull();
  });

  it("retourne null pour un brouillon même avec custom domain", () => {
    expect(getSitePublicUrl(draftWithCustomDomain)).toBeNull();
  });

  it("retourne l'URL publique pour un site publié", () => {
    expect(getSitePublicUrl(publishedWithSlug)).toBe("https://jestly.fr/s/mon-portfolio");
  });

  it("retourne le custom domain pour un site publié avec domaine", () => {
    expect(getSitePublicUrl(publishedWithCustomDomain)).toBe("https://portfolio.example.com");
  });

  it("retourne null pour un site publié sans slug", () => {
    expect(getSitePublicUrl(publishedWithoutSlug)).toBeNull();
  });
});

/* ── getSiteDisplayUrl ── */

describe("getSiteDisplayUrl", () => {
  it("retourne un texte brouillon pour un draft", () => {
    expect(getSiteDisplayUrl(draftWithSlug)).toBe("Brouillon — non publié");
  });

  it("retourne un texte brouillon même avec custom domain", () => {
    expect(getSiteDisplayUrl(draftWithCustomDomain)).toBe("Brouillon — non publié");
  });

  it("retourne l'URL display pour un site publié", () => {
    expect(getSiteDisplayUrl(publishedWithSlug)).toBe("jestly.fr/s/mon-portfolio");
  });

  it("retourne le custom domain pour un site publié avec domaine", () => {
    expect(getSiteDisplayUrl(publishedWithCustomDomain)).toBe("portfolio.example.com");
  });
});

/* ── getSitePreviewUrl ── */

describe("getSitePreviewUrl", () => {
  it("retourne null pour un brouillon", () => {
    expect(getSitePreviewUrl(draftWithSlug)).toBeNull();
  });

  it("retourne null pour un brouillon sans slug", () => {
    expect(getSitePreviewUrl(draftWithoutSlug)).toBeNull();
  });

  it("retourne l'URL relative pour un site publié", () => {
    expect(getSitePreviewUrl(publishedWithSlug)).toBe("/s/mon-portfolio");
  });

  it("retourne null pour un site publié sans slug", () => {
    expect(getSitePreviewUrl(publishedWithoutSlug)).toBeNull();
  });
});

/* ── getSiteEditorUrl / getSiteManageUrl (toujours disponibles) ── */

describe("getSiteEditorUrl", () => {
  it("fonctionne pour un brouillon", () => {
    expect(getSiteEditorUrl(draftWithSlug)).toBe("/site-web/uuid-123/createur");
  });

  it("fonctionne pour un site publié", () => {
    expect(getSiteEditorUrl(publishedWithSlug)).toBe("/site-web/uuid-789/createur");
  });
});

describe("getSiteManageUrl", () => {
  it("fonctionne pour un brouillon", () => {
    expect(getSiteManageUrl(draftWithSlug)).toBe("/site-web/uuid-123");
  });

  it("fonctionne pour un site publié", () => {
    expect(getSiteManageUrl(publishedWithSlug)).toBe("/site-web/uuid-789");
  });
});

/* ── Garde-fou : un brouillon ne doit JAMAIS avoir d'URL publique ── */

describe("garde-fou brouillon", () => {
  it("un brouillon avec un slug technique (site-xxxxx) n'obtient pas d'URL publique", () => {
    const technicalSlug: SiteUrlInput = { id: "x", slug: "site-mnepq3qz", status: "draft" };
    expect(getSitePublicUrl(technicalSlug)).toBeNull();
    expect(getSitePreviewUrl(technicalSlug)).toBeNull();
    expect(canOpenPublicSite(technicalSlug)).toBe(false);
  });

  it("un brouillon avec un beau slug n'obtient pas d'URL publique", () => {
    const niceSlug: SiteUrlInput = { id: "x", slug: "mon-super-site", status: "draft" };
    expect(getSitePublicUrl(niceSlug)).toBeNull();
    expect(canOpenPublicSite(niceSlug)).toBe(false);
  });
});
