import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { applyXp } from "@/lib/game/level";
import { z } from "zod";

const claimSchema = z.object({ achievementId: z.string() });

export async function GET() {
  try {
    const { player } = await requirePlayer();

    const all = await prisma.achievement.findMany();
    const playerAch = await prisma.playerAchievement.findMany({
      where: { playerId: player.id },
    });

    const map = new Map(playerAch.map((a) => [a.achievementId, a]));

    const achievements = all.map((a) => {
      const pa = map.get(a.id);
      return {
        ...a,
        description: a.hidden && !pa?.unlocked ? "???" : a.description,
        progress: pa?.progress ?? 0,
        unlocked: pa?.unlocked ?? false,
        claimed: pa?.claimed ?? false,
      };
    });

    return jsonOk({ achievements });
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
    const { achievementId } = claimSchema.parse(await request.json());

    const pa = await prisma.playerAchievement.findUnique({
      where: {
        playerId_achievementId: { playerId: player.id, achievementId },
      },
      include: { achievement: true },
    });

    if (!pa?.unlocked) return jsonError("Achievement not unlocked", 400);
    if (pa.claimed) return jsonError("Already claimed", 400);

    const { xpReward, goldReward } = pa.achievement;
    const levelResult = applyXp(player.level, player.xp, xpReward);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.playerAchievement.update({
        where: { id: pa.id },
        data: { claimed: true },
      });
      return tx.player.update({
        where: { id: player.id },
        data: {
          xp: levelResult.xp,
          level: levelResult.newLevel,
          rank: levelResult.newRank,
          xpToNextLevel: levelResult.xpToNextLevel,
          gold: player.gold + goldReward,
        },
      });
    });

    return jsonOk({ player: updated, rewards: { xp: xpReward, gold: goldReward } });
  } catch (err) {
    return handleApiError(err);
  }
}
