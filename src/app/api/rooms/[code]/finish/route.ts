import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { code } = await params;
    const roomCode = code.toUpperCase();

    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: { players: true },
    });

    if (!room || room.status !== "PLAYING") {
      return NextResponse.json(
        { error: "Game not active" },
        { status: 400 }
      );
    }

    await prisma.roomPlayer.updateMany({
      where: {
        roomId: room.id,
        userId: user.id,
      },
      data: {
        isFinished: true,
        finishedAt: new Date(),
      },
    });

    const updatedRoom = await prisma.room.findUnique({
      where: { roomCode },
      include: { players: true },
    });

    if (updatedRoom && updatedRoom.players.every((p: any) => p.isFinished)) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: "FINISHED" },
      });

      await prisma.gameResult.create({
        data: {
          roomId: room.id,
          reason: "all_finished",
        },
      });

      return NextResponse.json({
        gameEnded: true,
        reason: "all_finished",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Finished error:", error);
    return NextResponse.json(
      { error: "Failed to finish" },
      { status: 500 }
    );
  }
}
