import { SignJWT, jwtVerify } from "jose";

export type AccessTokenPayload = {
  sub: string;
  email: string;
  playerId?: string;
};

export type RefreshTokenPayload = {
  sub: string;
  sessionId: string;
};

function getAccessSecret() {
  const s = process.env.JWT_ACCESS_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_ACCESS_SECRET invalid");
  return new TextEncoder().encode(s);
}

function getRefreshSecret() {
  const s = process.env.JWT_REFRESH_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_REFRESH_SECRET invalid");
  return new TextEncoder().encode(s);
}

function parseExpiry(env: string | undefined, fallback: string): string {
  return env ?? fallback;
}

export async function signAccessToken(
  payload: AccessTokenPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(parseExpiry(process.env.JWT_ACCESS_EXPIRES, "15m"))
    .sign(getAccessSecret());
}

export async function signRefreshToken(
  payload: RefreshTokenPayload
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(parseExpiry(process.env.JWT_REFRESH_EXPIRES, "7d"))
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret());
    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret());
    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}
