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
    console.log("Join request for room:", roomCode, "by user:", user.id);

    const room = await (prisma as any).room.findUnique({
      where: { roomCode },
      include: { players: true },
    });

    if (!room) {
      console.log("Room not found:", roomCode);
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    console.log("Room found:", room.id, "status:", room.status, "players:", room.players.length);

    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Room is not available" },
        { status: 400 }
      );
    }

    if (room.players.length >= 4) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      );
    }

    const existingPlayer = room.players.find((p: any) => p.userId === user.id);
    if (existingPlayer) {
      console.log("User already in room");
      return NextResponse.json({ roomCode: room.roomCode });
    }

    const roomPlayer = await (prisma as any).roomPlayer.create({
      data: {
        roomId: room.id,
        userId: user.id,
      },
    });

    console.log("Room player created:", roomPlayer.id);
    return NextResponse.json({ roomCode: room.roomCode });
  } catch (error) {
    console.error("Join room error:", error);
    return NextResponse.json(
      { error: "Failed to join room" },
      { status: 500 }
    );
  }
}
