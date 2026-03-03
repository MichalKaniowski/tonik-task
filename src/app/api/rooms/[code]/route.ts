import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(request: Request, { params }: RouteContext) {
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

    const room = await (prisma as any).room.findUnique({
      where: { roomCode },
      include: {
        players: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        owner: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      roomCode: room.roomCode,
      status: room.status,
      currentSentence: room.currentSentence,
      owner: room.owner,
      players: room.players,
      isOwner: room.ownerId === user.id,
    });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to get room" },
      { status: 500 }
    );
  }
}
