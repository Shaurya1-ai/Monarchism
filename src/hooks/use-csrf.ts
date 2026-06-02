"use client";

import { useEffect, useState } from "react";

let cachedToken: string | null = null;

export function useCsrf() {
  const [token, setToken] = useState<string | null>(cachedToken);

  useEffect(() => {
    if (cachedToken) return;
    fetch("/api/csrf")
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.token) {
          cachedToken = res.data.token;
          setToken(res.data.token);
        }
      })
      .catch(console.error);
  }, []);

  return token;
}

export function getCsrfHeaders(token: string | null): HeadersInit {
  if (!token) return {};
  return { "x-csrf-token": token };
}
