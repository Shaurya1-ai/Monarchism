import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { z } from "zod";

const summonSchema = z.object({ templateId: z.string() });
const upgradeSchema = z.object({ shadowId: z.string() });

export async function GET() {
  try {
    const { player } = await requirePlayer();
    const [templates, shadows] = await Promise.all([
      prisma.shadowTemplate.findMany(),
      prisma.playerShadow.findMany({
        where: { playerId: player.id },
        include: { template: true },
      }),
    ]);
    return jsonOk({ templates, shadows });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }
    const { player } = await requirePlayer();
    const body = await request.json();

    if (body.shadowId) {
      const { shadowId } = upgradeSchema.parse(body);
      const shadow = await prisma.playerShadow.findFirst({
        where: { id: shadowId, playerId: player.id },
        include: { template: true },
      });
      if (!shadow) return jsonError("Shadow not found", 404);

      const cost = shadow.level * 100;
      if (player.gold < cost) return jsonError("Not enough gold", 400);

      const updated = await prisma.$transaction(async (tx) => {
        await tx.player.update({
          where: { id: player.id },
          data: { gold: player.gold - cost },
        });
        return tx.playerShadow.update({
          where: { id: shadow.id },
          data: {
            level: shadow.level + 1,
            power: shadow.power + Math.floor(shadow.template.basePower * 0.2),
          },
          include: { template: true },
        });
      });

      return jsonOk({ shadow: updated });
    }

    const { templateId } = summonSchema.parse(body);
    const template = await prisma.shadowTemplate.findUnique({
      where: { id: templateId },
    });
    if (!template) return jsonError("Template not found", 404);

    const cost = template.basePower * 10;
    if (player.gold < cost) return jsonError("Not enough gold", 400);
    if (player.level < 5) return jsonError("Reach level 5 to summon", 400);

    const shadow = await prisma.$transaction(async (tx) => {
      await tx.player.update({
        where: { id: player.id },
        data: { gold: player.gold - cost },
      });
      return tx.playerShadow.create({
        data: {
          playerId: player.id,
          templateId: template.id,
          power: template.basePower,
        },
        include: { template: true },
      });
    });

    return jsonOk({ shadow });
  } catch (err) {
    return handleApiError(err);
  }
}
