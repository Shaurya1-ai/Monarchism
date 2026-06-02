import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { allocateStatsSchema } from "@/lib/validators/auth";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { applyXp, statPointsForLevelUp } from "@/lib/game/level";

export async function GET() {
  try {
    const { player } = await requirePlayer();
    return jsonOk({ player });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(request: Request) {
  try {
    if (!(await validateCsrf(request))) {
      return jsonError("Invalid CSRF token", 403);
    }
    const { player } = await requirePlayer();
    const stats = allocateStatsSchema.parse(await request.json());

    const total =
      stats.strength +
      stats.agility +
      stats.intelligence +
      stats.vitality +
      stats.perception;

    const currentTotal =
      player.strength +
      player.agility +
      player.intelligence +
      player.vitality +
      player.perception;

    const baseStats = 10 * 5;
    const spent = currentTotal - baseStats;
    const toSpend = total - baseStats;

    if (toSpend > spent + player.statPoints) {
      return jsonError("Not enough stat points", 400);
    }

    const pointsUsed = toSpend - spent;
    const updated = await prisma.player.update({
      where: { id: player.id },
      data: {
        strength: stats.strength,
        agility: stats.agility,
        intelligence: stats.intelligence,
        vitality: stats.vitality,
        perception: stats.perception,
        statPoints: player.statPoints - pointsUsed,
      },
    });

    return jsonOk({ player: updated });
  } catch (err) {
    return handleApiError(err);
  }
}
