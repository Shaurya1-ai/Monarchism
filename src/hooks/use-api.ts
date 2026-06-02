"use client";

import { useCsrf, getCsrfHeaders } from "@/hooks/use-csrf";

type ApiResponse<T> = { success: boolean; data?: T; error?: string };

export function useApi() {
  const csrf = useCsrf();

  async function request<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...getCsrfHeaders(csrf),
      ...options.headers,
    };

    const res = await fetch(url, { ...options, headers });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error ?? "Request failed");
    }
    return json;
  }

  return { request, csrf };
}
