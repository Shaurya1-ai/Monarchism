import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { auditLog } from "@/lib/api/audit";

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }

    const body = resetPasswordSchema.parse(await request.json());
    const record = await prisma.passwordResetToken.findUnique({
      where: { token: body.token },
    });

    if (
      !record ||
      record.used ||
      record.expiresAt < new Date()
    ) {
      return jsonError("Invalid or expired token", 400);
    }

    const passwordHash = await hashPassword(body.password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { used: true },
      }),
      prisma.session.deleteMany({ where: { userId: record.userId } }),
    ]);

    await auditLog({
      userId: record.userId,
      action: "auth.password_reset",
    });

    return jsonOk({ message: "Password updated" });
  } catch (err) {
    return handleApiError(err);
  }
}
