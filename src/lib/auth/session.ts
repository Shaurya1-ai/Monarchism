import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import type { User, Player } from "@/generated/prisma";

const ACCESS_COOKIE = "monarch_access";
const REFRESH_COOKIE = "monarch_refresh";

export async function createSession(
  user: User & { player: Player | null },
  meta?: { userAgent?: string; ip?: string }
) {
  const refreshToken = nanoid(64);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshToken,
      userAgent: meta?.userAgent,
      ipAddress: meta?.ip,
      expiresAt,
    },
  });

  const accessToken = await signAccessToken({
    sub: user.id,
    email: user.email,
    playerId: user.player?.id,
  });

  const refreshJwt = await signRefreshToken({
    sub: user.id,
    sessionId: session.id,
  });

  const cookieStore = await cookies();
  const secure = process.env.NODE_ENV === "production";

  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 15,
  });

  cookieStore.set(REFRESH_COOKIE, refreshJwt, {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { accessToken, session };
}

export async function clearSession() {
  const cookieStore = await cookies();
  const refresh = cookieStore.get(REFRESH_COOKIE)?.value;
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);

  if (refresh) {
    const { verifyRefreshToken } = await import("@/lib/auth/jwt");
    const payload = await verifyRefreshToken(refresh);
    if (payload?.sessionId) {
      await prisma.session.deleteMany({ where: { id: payload.sessionId } });
    }
  }
}

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value ?? null;
}

export { ACCESS_COOKIE, REFRESH_COOKIE };
