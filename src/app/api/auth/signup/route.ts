import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { signupSchema } from "@/lib/validators/auth";
import { sanitizeText } from "@/lib/security/sanitize";
import { isRateLimited } from "@/lib/security/rate-limit";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { auditLog } from "@/lib/api/audit";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (await isRateLimited(`signup:${ip}`, "auth")) {
      return jsonError("Too many requests", 429);
    }

    const body = signupSchema.parse(await request.json());
    const email = body.email.toLowerCase().trim();
    const displayName = sanitizeText(body.displayName, 32);
    const hunterName = sanitizeText(body.hunterName, 20);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return jsonError("Email already registered", 409);

    const hunterTaken = await prisma.player.findUnique({
      where: { hunterName },
    });
    if (hunterTaken) return jsonError("Hunter name taken", 409);

    const passwordHash = await hashPassword(body.password);
    const verifyToken = nanoid(48);

    const devAutoVerify = process.env.NODE_ENV === "development";

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        emailVerified: devAutoVerify,
        emailTokens: devAutoVerify
          ? undefined
          : {
              create: {
                token: verifyToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
              },
            },
        player: {
          create: { hunterName },
        },
      },
      include: { player: true },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    await sendEmail({
      to: email,
      subject: "Verify your Monarch System account",
      html: `<p>Welcome, Hunter.</p><p><a href="${appUrl}/verify?token=${verifyToken}">Verify email</a></p>`,
    });

    // Starter kit for new hunters
    if (user.player) {
      const starterItems = await prisma.itemCatalog.findMany({
        where: { slug: { in: ["iron-blade", "hunter-coat", "health-potion"] } },
      });
      if (starterItems.length > 0) {
        await prisma.inventoryItem.createMany({
          data: starterItems.map((item) => ({
            playerId: user.player!.id,
            itemId: item.id,
            quantity: item.type === "POTION" ? 3 : 1,
          })),
        });
      }
    }

    await auditLog({
      userId: user.id,
      action: "auth.signup",
      ipAddress: ip,
    });

    return jsonOk({
      message: "Account created. Check your email to verify.",
      userId: user.id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
