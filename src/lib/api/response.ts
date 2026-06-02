import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/get-user";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(err: unknown) {
  if (err instanceof AuthError) {
    return jsonError(err.message, err.status);
  }
  if (err instanceof ZodError) {
    return jsonError(err.issues[0]?.message ?? "Validation failed", 422);
  }
  console.error("[API]", err);
  return jsonError("Internal server error", 500);
}
