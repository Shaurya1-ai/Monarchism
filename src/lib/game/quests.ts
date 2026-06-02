import { prisma } from "@/lib/db/prisma";

/** Assign 3 random daily quests if none active for today */
export async function ensureDailyQuests(playerId: string, playerLevel: number) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await prisma.playerQuest.findFirst({
    where: {
      playerId,
      assignedAt: { gte: startOfDay },
    },
  });

  if (existing) {
    return prisma.playerQuest.findMany({
      where: { playerId, assignedAt: { gte: startOfDay } },
      include: { template: true },
    });
  }

  const templates = await prisma.questTemplate.findMany({
    where: { active: true, minLevel: { lte: playerLevel } },
  });

  if (templates.length === 0) return [];

  // Weighted random selection without replacement
  const picked: typeof templates = [];
  const pool = [...templates];
  const count = Math.min(3, pool.length);

  for (let i = 0; i < count; i++) {
    const totalWeight = pool.reduce((s, t) => s + t.weight, 0);
    let roll = Math.random() * totalWeight;
    let idx = 0;
    for (let j = 0; j < pool.length; j++) {
      roll -= pool[j].weight;
      if (roll <= 0) {
        idx = j;
        break;
      }
    }
    picked.push(pool[idx]);
    pool.splice(idx, 1);
  }

  await prisma.playerQuest.createMany({
    data: picked.map((t) => ({
      playerId,
      templateId: t.id,
      target: 1 + Math.floor(Math.random() * 3),
      progress: 0,
    })),
  });

  return prisma.playerQuest.findMany({
    where: { playerId, assignedAt: { gte: startOfDay } },
    include: { template: true },
  });
}
