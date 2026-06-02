import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { ensureDailyQuests } from "@/lib/game/quests";
import { applyXp, statPointsForLevelUp } from "@/lib/game/level";
import { z } from "zod";

const completeSchema = z.object({ questId: z.string() });

export async function GET() {
  try {
    const { player } = await requirePlayer();
    const quests = await ensureDailyQuests(player.id, player.level);
    return jsonOk({ quests });
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
    const { questId } = completeSchema.parse(await request.json());

    const quest = await prisma.playerQuest.findFirst({
      where: { id: questId, playerId: player.id, status: "ACTIVE" },
      include: { template: true },
    });

    if (!quest) return jsonError("Quest not found", 404);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastQuest = player.lastQuestDate
      ? new Date(player.lastQuestDate)
      : null;
    let streak = player.questStreak;
    if (!lastQuest || lastQuest < today) {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      streak =
        lastQuest && lastQuest >= yesterday ? streak + 1 : 1;
    }

    const streakBonus = Math.min(streak * 0.05, 0.5);
    const xpGain = Math.floor(
      quest.template.xpReward * (1 + streakBonus)
    );
    const goldGain = Math.floor(
      quest.template.goldReward * (1 + streakBonus)
    );

    const levelResult = applyXp(player.level, player.xp, xpGain);

    const updated = await prisma.$transaction(async (tx) => {
      await tx.playerQuest.update({
        where: { id: quest.id },
        data: { status: "COMPLETED", progress: quest.target, completedAt: new Date() },
      });

      return tx.player.update({
        where: { id: player.id },
        data: {
          xp: levelResult.xp,
          level: levelResult.newLevel,
          rank: levelResult.newRank,
          xpToNextLevel: levelResult.xpToNextLevel,
          gold: player.gold + goldGain,
          questStreak: streak,
          lastQuestDate: new Date(),
          statPoints:
            player.statPoints + statPointsForLevelUp(levelResult.levelsGained),
        },
      });
    });

    return jsonOk({
      player: updated,
      rewards: { xp: xpGain, gold: goldGain, streak },
      levelUp: levelResult.leveledUp
        ? {
            newLevel: levelResult.newLevel,
            newRank: levelResult.newRank,
            levelsGained: levelResult.levelsGained,
          }
        : null,
    });
  } catch (err) {
    return handleApiError(err);
  }
}
