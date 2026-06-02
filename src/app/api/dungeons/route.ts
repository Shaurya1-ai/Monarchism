import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { generateDungeon, rollDungeonCombat } from "@/lib/game/dungeons";
import { applyXp } from "@/lib/game/level";
import { z } from "zod";

const startSchema = z.object({ difficulty: z.number().int().min(1).max(10) });
const advanceSchema = z.object({ runId: z.string() });

export async function GET() {
  try {
    const { player } = await requirePlayer();
    const active = await prisma.dungeonRun.findFirst({
      where: { playerId: player.id, status: "IN_PROGRESS" },
    });
    const cooldown = player.dungeonCooldown;
    return jsonOk({ active, cooldown });
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

    if (body.runId) {
      const { runId } = advanceSchema.parse(body);
      const run = await prisma.dungeonRun.findFirst({
        where: { id: runId, playerId: player.id, status: "IN_PROGRESS" },
      });
      if (!run) return jsonError("Run not found", 404);

      const power =
        player.strength +
        player.agility +
        player.intelligence +
        player.vitality +
        player.perception;

      const combat = rollDungeonCombat(run.seed, run.currentFloor, power);

      if (!combat.success) {
        const failed = await prisma.dungeonRun.update({
          where: { id: run.id },
          data: { status: "FAILED", completedAt: new Date() },
        });
        return jsonOk({ run: failed, combat, failed: true });
      }

      const nextFloor = run.currentFloor + 1;
      const completed = nextFloor > run.floors;

      if (completed) {
        const xpGain = run.xpEarned || 100;
        const goldGain = run.goldEarned || 50;
        const levelResult = applyXp(player.level, player.xp, xpGain);
        const cooldown = new Date(Date.now() + 30 * 60 * 1000);

        const [updatedRun, updatedPlayer] = await prisma.$transaction([
          prisma.dungeonRun.update({
            where: { id: run.id },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
              currentFloor: run.floors,
            },
          }),
          prisma.player.update({
            where: { id: player.id },
            data: {
              xp: levelResult.xp,
              level: levelResult.newLevel,
              rank: levelResult.newRank,
              xpToNextLevel: levelResult.xpToNextLevel,
              gold: player.gold + goldGain,
              dungeonCooldown: cooldown,
            },
          }),
        ]);

        return jsonOk({
          run: updatedRun,
          player: updatedPlayer,
          completed: true,
          rewards: { xp: xpGain, gold: goldGain },
          levelUp: levelResult.leveledUp ? levelResult : null,
        });
      }

      const updated = await prisma.dungeonRun.update({
        where: { id: run.id },
        data: { currentFloor: nextFloor },
      });
      return jsonOk({ run: updated, combat, completed: false });
    }

    const { difficulty } = startSchema.parse(body);

    if (player.dungeonCooldown && player.dungeonCooldown > new Date()) {
      return jsonError("Dungeon on cooldown", 429);
    }

    const existing = await prisma.dungeonRun.findFirst({
      where: { playerId: player.id, status: "IN_PROGRESS" },
    });
    if (existing) return jsonError("Dungeon already in progress", 400);

    const gen = generateDungeon(player.id, difficulty);
    const run = await prisma.dungeonRun.create({
      data: {
        playerId: player.id,
        seed: gen.seed,
        difficulty: gen.difficulty,
        floors: gen.floors,
        bossName: gen.bossName,
        xpEarned: gen.baseXp,
        goldEarned: gen.baseGold,
      },
    });

    return jsonOk({ run, dungeon: gen });
  } catch (err) {
    return handleApiError(err);
  }
}
