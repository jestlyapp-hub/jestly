import { describe, it, expect, vi } from "vitest";
import { ApiError, handleApiError } from "@/lib/api-error";

// Mock the logger to avoid side effects
vi.mock("@/lib/logger", () => ({
  logger: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock NextResponse.json since we're not in a Next.js runtime
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
    }),
  },
}));

describe("ApiError", () => {
  it("creates an error with statusCode and message", () => {
    const err = new ApiError(404, "Non trouvé");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Non trouvé");
    expect(err).toBeInstanceOf(Error);
  });

  it("supports optional details", () => {
    const err = new ApiError(400, "Invalide", { field: "email" });
    expect(err.details).toEqual({ field: "email" });
  });
});

describe("handleApiError", () => {
  it("handles ApiError instances with their status code", () => {
    const err = new ApiError(403, "Accès refusé");
    const response = handleApiError(err) as { body: { error: string }; status: number };
    expect(response.status).toBe(403);
    expect(response.body.error).toBe("Accès refusé");
  });

  it("handles generic errors as 500", () => {
    const err = new Error("Something broke");
    const response = handleApiError(err) as { body: { error: string }; status: number };
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Une erreur est survenue");
  });

  it("handles non-Error values as 500", () => {
    const response = handleApiError("string error") as { body: { error: string }; status: number };
    expect(response.status).toBe(500);
  });
});
