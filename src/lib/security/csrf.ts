import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const CSRF_COOKIE = "monarch_csrf";
const CSRF_HEADER = "x-csrf-token";

function getSecret(): string {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CSRF_SECRET must be set (min 32 chars)");
  }
  return secret;
}

export function generateCsrfToken(): string {
  const nonce = randomBytes(32).toString("hex");
  const sig = createHmac("sha256", getSecret()).update(nonce).digest("hex");
  return `${nonce}.${sig}`;
}

export function verifyCsrfToken(token: string): boolean {
  const [nonce, sig] = token.split(".");
  if (!nonce || !sig) return false;
  const expected = createHmac("sha256", getSecret()).update(nonce).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function setCsrfCookie(): Promise<string> {
  const token = generateCsrfToken();
  const cookieStore = await cookies();
  cookieStore.set(CSRF_COOKIE, token, {
    httpOnly: false, // double-submit: client reads and sends header
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60 * 24,
  });
  return token;
}

export async function validateCsrf(request: Request): Promise<boolean> {
  const headerToken = request.headers.get(CSRF_HEADER);
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE)?.value;
  if (!headerToken || !cookieToken) return false;
  if (headerToken !== cookieToken) return false;
  return verifyCsrfToken(headerToken);
}

export { CSRF_COOKIE, CSRF_HEADER };
