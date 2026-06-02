import { prisma } from "@/lib/db/prisma";
import { verifyEmailSchema } from "@/lib/validators/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const { token } = verifyEmailSchema.parse(await request.json());

    const record = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!record || record.expiresAt < new Date()) {
      return jsonError("Invalid or expired token", 400);
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: record.userId },
        data: { emailVerified: true },
      }),
      prisma.emailVerificationToken.delete({ where: { id: record.id } }),
    ]);

    return jsonOk({ message: "Email verified successfully" });
  } catch (err) {
    return handleApiError(err);
  }
}
