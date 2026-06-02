import { prisma } from "@/lib/db/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getAccessTokenFromCookies } from "@/lib/auth/session";

export async function getCurrentUser() {
  const token = await getAccessTokenFromCookies();
  if (!token) return null;

  const payload = await verifyAccessToken(token);
  if (!payload?.sub) return null;

  return prisma.user.findUnique({
    where: { id: payload.sub },
    include: { player: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError("Unauthorized");
  }
  return user;
}

export async function requirePlayer() {
  const user = await requireUser();
  if (!user.player) {
    throw new AuthError("Player profile not found");
  }
  if (!user.emailVerified) {
    throw new AuthError("Email not verified");
  }
  return { user, player: user.player };
}

export class AuthError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
