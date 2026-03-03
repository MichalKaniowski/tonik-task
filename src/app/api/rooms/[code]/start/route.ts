import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { sentences } from "@/sentences";
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

    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    if (room.ownerId !== user.id) {
      return NextResponse.json(
        { error: "Only room owner can start the game" },
        { status: 403 }
      );
    }

    if (room.status !== "WAITING") {
      return NextResponse.json(
        { error: "Game has already started" },
        { status: 400 }
      );
    }

    if (room.players.length < 1) {
      return NextResponse.json(
        { error: "Need at least 1 player to start" },
        { status: 400 }
      );
    }

    const randomSentence = sentences[Math.floor(Math.random() * sentences.length)];

    const updatedRoom = await prisma.room.update({
      where: { id: room.id },
      data: {
        status: "PLAYING",
        currentSentence: randomSentence,
      },
    });

    return NextResponse.json({
      sentence: randomSentence,
    });
  } catch (error) {
    console.error("Start game error:", error);
    return NextResponse.json(
      { error: "Failed to start game" },
      { status: 500 }
    );
  }
}
