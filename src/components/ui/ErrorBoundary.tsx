"use client";

import { Component, type ReactNode } from "react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    logger.error("react_error_boundary", {
      action: "uncaught_error",
      route:
        typeof window !== "undefined"
          ? window.location.pathname
          : "unknown",
      error: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: info.componentStack?.slice(0, 500),
    } as Record<string, unknown>);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[300px] gap-4 p-8">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-[15px] font-semibold text-[#191919]">
              Une erreur est survenue
            </h3>
            <p className="text-[13px] text-[#5A5A58] text-center max-w-md">
              Un problème inattendu s&apos;est produit. Rechargez la page pour
              continuer.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 text-[13px] font-medium text-white bg-[#4F46E5] rounded-md hover:bg-[#4338CA] transition-colors"
            >
              Recharger la page
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
