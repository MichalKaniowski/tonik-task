import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";
import { prisma } from "./src/lib/prisma";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socket",
    addTrailingSlash: false,
  });

  io.on("connection", (socket) => {
    socket.on("join_room", async ({ roomCode, userId }) => {
      try {
        const room = await prisma.room.findUnique({
          where: { roomCode: roomCode.toUpperCase() },
          include: { players: true },
        });

        if (!room) {
          socket.emit("error", { message: "Room not found" });
          return;
        }

        socket.join(roomCode);
        
        io.to(roomCode).emit("room_updated", {
          players: room.players,
        });
      } catch (error) {
        console.error("Join room error:", error);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    socket.on("leave_room", ({ roomCode }) => {
      socket.leave(roomCode);
    });

    socket.on("typing_progress", async ({ roomCode, userId, progress, enteredText }) => {
      try {
        await prisma.roomPlayer.updateMany({
          where: {
            roomId: roomCode,
            userId: userId,
          },
          data: {
            progress,
            enteredText,
          },
        });

        socket.to(roomCode).emit("player_progress", {
          userId,
          progress,
          enteredText,
        });
      } catch (error) {
        console.error("Typing progress error:", error);
      }
    });

    socket.on("player_finished", async ({ roomCode, userId }) => {
      try {
        await prisma.roomPlayer.updateMany({
          where: {
            roomId: roomCode,
            userId: userId,
          },
          data: {
            isFinished: true,
            finishedAt: new Date(),
          },
        });

        const room = await prisma.room.findUnique({
          where: { roomCode },
          include: { players: true },
        });

        if (room) {
          const allFinished = room.players.every((p: any) => p.isFinished);

          if (allFinished) {
            await prisma.room.update({
              where: { id: room.id },
              data: { status: "FINISHED" },
            });

            io.to(roomCode).emit("game_over", {
              reason: "all_finished",
              players: room.players,
            });
          } else {
            io.to(roomCode).emit("player_finished", { userId });
          }
        }
      } catch (error) {
        console.error("Player finished error:", error);
      }
    });

    socket.on("disconnect", () => {});
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {});
});
