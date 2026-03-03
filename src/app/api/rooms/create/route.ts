import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export async function POST() {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const roomCode = nanoid(6).toUpperCase();

    const room = await (prisma as any).room.create({
      data: {
        roomCode,
        ownerId: user.id,
        status: "WAITING",
      },
    });

    const roomPlayer = await (prisma as any).roomPlayer.create({
      data: {
        roomId: room.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ roomCode: room.roomCode });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
