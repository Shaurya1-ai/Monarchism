"use client";

import { useCsrf, getCsrfHeaders } from "@/hooks/use-csrf";

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

export function useApi() {
  const csrf = useCsrf();
  
  async function ensureCsrfToken(): Promise<string | null> {
    if (csrf) return csrf;
    try {
      const res = await fetch("/api/csrf", { method: "GET" });
      const data = await res.json();
      return data?.data?.token ?? null;
    } catch {
      return null;
    }
  }

  async function request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const method = (options.method ?? "GET").toUpperCase();
    const needsCsrf = ["POST", "PUT", "PATCH", "DELETE"].includes(method);
    const csrfToken = needsCsrf ? await ensureCsrfToken() : csrf;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getCsrfHeaders(csrfToken),
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json() : await res.text();

    if (!res.ok) {
      if (isJson && payload && typeof payload === "object") {
        const message =
          "error" in payload && typeof payload.error === "string"
            ? payload.error
            : `Request failed (${res.status})`;
        throw new Error(message);
      }

      // Vercel/server errors can return HTML; surface a human-friendly message.
      throw new Error(
        `Server error (${res.status}). Check deployment env vars and database connectivity.`
      );
    }

    if (!isJson || !payload || typeof payload !== "object") {
      throw new Error("Unexpected non-JSON response from API.");
    }

    return payload as ApiResponse<T>;
  }

  return { request, csrf };
}
