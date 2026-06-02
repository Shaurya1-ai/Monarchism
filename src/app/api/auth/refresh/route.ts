import { cookies } from "next/headers";
import { prisma } from "@/lib/db/prisma";
import { verifyRefreshToken, signAccessToken } from "@/lib/auth/jwt";
import { REFRESH_COOKIE, ACCESS_COOKIE } from "@/lib/auth/session";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refreshJwt = cookieStore.get(REFRESH_COOKIE)?.value;
    if (!refreshJwt) return jsonError("No refresh token", 401);

    const payload = await verifyRefreshToken(refreshJwt);
    if (!payload?.sessionId) return jsonError("Invalid token", 401);

    const session = await prisma.session.findUnique({
      where: { id: payload.sessionId },
      include: { user: { include: { player: true } } },
    });

    if (!session || session.expiresAt < new Date()) {
      return jsonError("Session expired", 401);
    }

    const accessToken = await signAccessToken({
      sub: session.user.id,
      email: session.user.email,
      playerId: session.user.player?.id,
    });

    cookieStore.set(ACCESS_COOKIE, accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 15,
    });

    return jsonOk({ refreshed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
