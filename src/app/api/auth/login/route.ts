import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validators/auth";
import { isRateLimited } from "@/lib/security/rate-limit";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { auditLog } from "@/lib/api/audit";

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (await isRateLimited(`login:${ip}`, "auth")) {
      return jsonError("Too many requests", 429);
    }

    const body = loginSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
      include: { player: true },
    });

    if (!user || !(await verifyPassword(user.passwordHash, body.password))) {
      await auditLog({ action: "auth.login_failed", ipAddress: ip });
      return jsonError("Invalid credentials", 401);
    }

    if (!user.emailVerified) {
      return jsonError("Please verify your email first", 403);
    }

    await createSession(user, {
      userAgent: request.headers.get("user-agent") ?? undefined,
      ip,
    });

    await auditLog({
      userId: user.id,
      action: "auth.login",
      ipAddress: ip,
    });

    return jsonOk({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        player: user.player,
      },
    });
  } catch (err) {
    return handleApiError(err);
  }
}
