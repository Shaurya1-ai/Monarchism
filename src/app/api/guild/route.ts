import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { sanitizeText } from "@/lib/security/sanitize";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(3).max(32),
  tag: z.string().min(2).max(5).regex(/^[A-Z0-9]+$/),
  description: z.string().max(200).optional(),
});

const joinSchema = z.object({ guildId: z.string() });
const messageSchema = z.object({ content: z.string().min(1).max(500) });

export async function GET() {
  try {
    const { player } = await requirePlayer();

    const membership = await prisma.guildMember.findUnique({
      where: { playerId: player.id },
      include: {
        guild: {
          include: {
            members: {
              include: {
                player: {
                  select: { hunterName: true, level: true, rank: true },
                },
              },
            },
            messages: {
              orderBy: { createdAt: "desc" },
              take: 50,
            },
          },
        },
      },
    });

    const guilds = await prisma.guild.findMany({
      orderBy: { xp: "desc" },
      take: 20,
      include: { _count: { select: { members: true } } },
    });

    return jsonOk({ membership, guilds });
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

    if (body.content) {
      const { content } = messageSchema.parse(body);
      const member = await prisma.guildMember.findUnique({
        where: { playerId: player.id },
      });
      if (!member) return jsonError("Not in a guild", 400);

      const msg = await prisma.guildMessage.create({
        data: {
          guildId: member.guildId,
          playerId: player.id,
          content: sanitizeText(content, 500),
        },
      });
      return jsonOk({ message: msg });
    }

    if (body.guildId) {
      const { guildId } = joinSchema.parse(body);
      const existing = await prisma.guildMember.findUnique({
        where: { playerId: player.id },
      });
      if (existing) return jsonError("Already in a guild", 400);

      const member = await prisma.guildMember.create({
        data: { guildId, playerId: player.id },
      });
      return jsonOk({ member });
    }

    const data = createSchema.parse(body);
    const existing = await prisma.guildMember.findUnique({
      where: { playerId: player.id },
    });
    if (existing) return jsonError("Already in a guild", 400);

    const guild = await prisma.guild.create({
      data: {
        name: sanitizeText(data.name, 32),
        tag: data.tag.toUpperCase(),
        description: data.description
          ? sanitizeText(data.description, 200)
          : null,
        members: {
          create: { playerId: player.id, role: "LEADER" },
        },
      },
    });

    return jsonOk({ guild });
  } catch (err) {
    return handleApiError(err);
  }
}
