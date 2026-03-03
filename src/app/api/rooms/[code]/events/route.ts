import { validateRequest } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  console.log("SSE: New connection request");
  const { user } = await validateRequest();
  
  console.log("SSE: User:", user?.id);
  
  if (!user) {
    console.log("SSE: Unauthorized");
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomCode = searchParams.get("roomCode")?.toUpperCase();

  console.log("SSE: Request for room:", roomCode);

  if (!roomCode) {
    return new Response("Room code required", { status: 400 });
  }

  const encoder = new TextEncoder();
  const intervals: NodeJS.Timeout[] = [];
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        try {
          const message = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(encoder.encode(message));
        } catch (e) {
          console.error("Error sending event:", e);
        }
      };

      const keepAliveInterval = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"));
        } catch (e) {
          clearInterval(keepAliveInterval);
        }
      }, 30000);
      intervals.push(keepAliveInterval);

      const updateRoom = async () => {
        try {
          console.log("SSE: Fetching room:", roomCode, "at:", new Date().toISOString());
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
            console.log("SSE: Room not found for code:", roomCode);
            return;
          }

          console.log("SSE: Room found with status:", room.status, "players:", room.players.length);
          
          const eventData = {
            type: "room_state",
            data: room,
          };
          console.log("SSE: Sending event for players:", room.players.map((p: any) => p.user.username));
          console.log("SSE: Event data length:", JSON.stringify(eventData).length);
          sendEvent(eventData);
        } catch (e) {
          console.error("SSE: Error fetching room:", e);
        }
      };

      await updateRoom();
      const updateInterval = setInterval(updateRoom, 300);
      intervals.push(updateInterval);

      request.signal.addEventListener("abort", () => {
        console.log("SSE: Connection aborted");
        intervals.forEach(i => clearInterval(i));
        try {
          controller.close();
        } catch (e) {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
