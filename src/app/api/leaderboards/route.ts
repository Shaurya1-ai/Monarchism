import { prisma } from "@/lib/db/prisma";
import { jsonOk, handleApiError } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") ?? "xp";

    const players = await prisma.player.findMany({
      orderBy: category === "level" ? { level: "desc" } : { xp: "desc" },
      take: 50,
      select: {
        id: true,
        hunterName: true,
        level: true,
        xp: true,
        rank: true,
        guildMember: {
          select: { guild: { select: { name: true, tag: true } } },
        },
      },
    });

    const ranked = players.map((p, i) => ({
      rank: i + 1,
      hunterName: p.hunterName,
      level: p.level,
      xp: p.xp,
      playerRank: p.rank,
      guild: p.guildMember?.guild ?? null,
    }));

    return jsonOk({ category, leaderboard: ranked });
  } catch (err) {
    return handleApiError(err);
  }
}
