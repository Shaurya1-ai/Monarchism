import { prisma } from "@/lib/db/prisma";
import { requirePlayer } from "@/lib/auth/get-user";
import { validateCsrf } from "@/lib/security/csrf";
import { jsonOk, jsonError, handleApiError } from "@/lib/api/response";
import { z } from "zod";

const equipSchema = z.object({
  inventoryItemId: z.string(),
  slot: z.enum(["WEAPON", "HEAD", "CHEST", "LEGS", "ACCESSORY"]),
});

export async function GET() {
  try {
    const { player } = await requirePlayer();
    const [inventory, equipment] = await Promise.all([
      prisma.inventoryItem.findMany({
        where: { playerId: player.id },
        include: { item: true },
      }),
      prisma.playerEquipment.findMany({
        where: { playerId: player.id },
        include: { item: true },
      }),
    ]);
    return jsonOk({ inventory, equipment });
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
    const { inventoryItemId, slot } = equipSchema.parse(await request.json());

    const inv = await prisma.inventoryItem.findFirst({
      where: { id: inventoryItemId, playerId: player.id },
      include: { item: true },
    });

    if (!inv) return jsonError("Item not found", 404);
    if (inv.item.minLevel > player.level) {
      return jsonError("Level too low", 400);
    }

    await prisma.playerEquipment.upsert({
      where: { playerId_slot: { playerId: player.id, slot } },
      create: { playerId: player.id, slot, itemId: inv.itemId },
      update: { itemId: inv.itemId },
    });

    const equipment = await prisma.playerEquipment.findMany({
      where: { playerId: player.id },
      include: { item: true },
    });

    return jsonOk({ equipment });
  } catch (err) {
    return handleApiError(err);
  }
}
