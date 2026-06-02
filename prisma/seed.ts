import { PrismaClient } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Monarch System...");

  await prisma.questTemplate.createMany({
    skipDuplicates: true,
    data: [
      { id: "qt1", title: "Morning Training", description: "Complete 30 minutes of physical training", minLevel: 1, xpReward: 50, goldReward: 25, weight: 3 },
      { id: "qt2", title: "Mana Meditation", description: "Meditate to stabilize your mana core", minLevel: 1, xpReward: 40, goldReward: 20, weight: 2 },
      { id: "qt3", title: "Gate Reconnaissance", description: "Scout a nearby dungeon gate", minLevel: 5, xpReward: 80, goldReward: 40, weight: 2 },
      { id: "qt4", title: "Shadow Extraction Practice", description: "Practice shadow extraction techniques", minLevel: 5, xpReward: 100, goldReward: 50, weight: 1 },
      { id: "qt5", title: "Hunter Guild Patrol", description: "Patrol assigned sector for anomalies", minLevel: 10, xpReward: 120, goldReward: 60, weight: 2 },
      { id: "qt6", title: "Equipment Maintenance", description: "Maintain weapons and armor", minLevel: 1, xpReward: 35, goldReward: 15, weight: 3 },
    ],
  });

  await prisma.achievement.createMany({
    skipDuplicates: true,
    data: [
      { id: "a1", slug: "first-steps", title: "First Steps", description: "Reach level 2", icon: "🎯", xpReward: 25, goldReward: 50, target: 1, category: "level", hidden: false },
      { id: "a2", slug: "gate-breaker", title: "Gate Breaker", description: "Complete your first dungeon", icon: "🏰", xpReward: 100, goldReward: 100, target: 1, category: "dungeon", hidden: false },
      { id: "a3", slug: "shadow-monarch", title: "???", description: "Summon 10 shadows", icon: "👤", xpReward: 500, goldReward: 500, target: 10, category: "shadow", hidden: true },
      { id: "a4", slug: "streak-master", title: "Streak Master", description: "Maintain a 7-day quest streak", icon: "🔥", xpReward: 200, goldReward: 200, target: 7, category: "quest", hidden: false },
    ],
  });

  await prisma.itemCatalog.createMany({
    skipDuplicates: true,
    data: [
      { id: "i1", slug: "iron-blade", name: "Iron Blade", description: "A reliable hunter sword", type: "WEAPON", rarity: "COMMON", slot: "WEAPON", attack: 12, defense: 0, minLevel: 1, icon: "🗡️" },
      { id: "i2", slug: "shadow-dagger", name: "Shadow Dagger", description: "Forged in dungeon darkness", type: "WEAPON", rarity: "RARE", slot: "WEAPON", attack: 28, defense: 0, minLevel: 10, icon: "🗡️" },
      { id: "i3", slug: "hunter-coat", name: "Hunter Coat", description: "Standard issue armor", type: "ARMOR", rarity: "COMMON", slot: "CHEST", attack: 0, defense: 15, minLevel: 1, icon: "🛡️" },
      { id: "i4", slug: "mana-helm", name: "Mana Helm", description: "Enhances perception", type: "ARMOR", rarity: "UNCOMMON", slot: "HEAD", attack: 0, defense: 10, minLevel: 5, icon: "⛑️" },
      { id: "i5", slug: "health-potion", name: "Health Potion", description: "Restores vitality", type: "POTION", rarity: "COMMON", slot: null, attack: 0, defense: 0, healAmount: 50, minLevel: 1, icon: "🧪" },
      { id: "i6", slug: "monarch-ring", name: "Monarch Ring", description: "Radiates overwhelming power", type: "ACCESSORY", rarity: "MONARCH", slot: "ACCESSORY", attack: 50, defense: 30, minLevel: 50, icon: "💍" },
    ],
  });

  await prisma.shadowTemplate.createMany({
    skipDuplicates: true,
    data: [
      { id: "s1", slug: "igris", name: "Igris", title: "Blood-Red Commander", grade: "KNIGHT", basePower: 120, icon: "⚔️", description: "Former knight of the dungeon" },
      { id: "s2", slug: "tank", name: "Tank", title: "Iron Body", grade: "ELITE", basePower: 80, icon: "🛡️", description: "Elite shield bearer" },
      { id: "s3", slug: "beru", name: "Beru", title: "Ant King", grade: "MARSHAL", basePower: 200, icon: "🐜", description: "Marshal-grade shadow ant" },
    ],
  });

  console.log("Seed complete.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
