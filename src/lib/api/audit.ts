import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma";

export async function auditLog(params: {
  userId?: string;
  action: string;
  resource?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        resource: params.resource,
        metadata: params.metadata,
        ipAddress: params.ipAddress,
      },
    });
  } catch (e) {
    console.error("[Audit]", e);
  }
}
