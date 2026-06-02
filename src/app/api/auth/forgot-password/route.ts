import { nanoid } from "nanoid";
import { prisma } from "@/lib/db/prisma";
import { forgotPasswordSchema } from "@/lib/validators/auth";
import { isRateLimited } from "@/lib/security/rate-limit";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { sendEmail } from "@/lib/email/send";

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    if (await isRateLimited(`forgot:${ip}`, "strict")) {
      return jsonError("Too many requests", 429);
    }

    const { email } = forgotPasswordSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Always return success to prevent email enumeration
    if (user) {
      const token = nanoid(48);
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
      await sendEmail({
        to: user.email,
        subject: "Reset your Monarch System password",
        html: `<p><a href="${appUrl}/reset-password?token=${token}">Reset password</a></p>`,
      });
    }

    return jsonOk({
      message: "If that email exists, a reset link was sent.",
    });
  } catch (err) {
    return handleApiError(err);
  }
}
