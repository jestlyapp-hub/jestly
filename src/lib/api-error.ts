import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

export function apiError(
  status: number,
  message: string,
  context?: Record<string, unknown>
) {
  if (status >= 500) {
    logger.error("api_error", {
      action: "server_error",
      ...context,
      error: message,
    } as Record<string, unknown>);
  }
  return NextResponse.json(
    {
      error: message,
      ...(process.env.NODE_ENV === "development" && context
        ? { details: context }
        : {}),
    },
    { status }
  );
}

export function handleApiError(
  error: unknown,
  context?: Record<string, unknown>
) {
  if (error instanceof ApiError) {
    return apiError(error.statusCode, error.message, context);
  }
  const message =
    error instanceof Error ? error.message : "Erreur interne du serveur";
  logger.error("unhandled_api_error", {
    ...context,
    error: message,
  } as Record<string, unknown>);
  return apiError(500, "Une erreur est survenue", context);
}
