"use client";

import { useSession } from "@/components/auth/SessionProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { logout } from "@/features/auth/actions/logout";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function DashboardPage() {
  const { user } = useSession();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");
  const [joinPending, setJoinPending] = useState(false);
  const [createPending, setCreatePending] = useState(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setJoinPending(true);

    try {
      const response = await fetch(`/api/rooms/${roomCode}/join`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to join room");
      } else {
        console.log("Redirecting to room:", roomCode);
        window.location.href = `/room/${roomCode}`;
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setJoinPending(false);
    }
  };

  const handleCreateRoom = async () => {
    setError("");
    setCreatePending(true);

    try {
      const response = await fetch("/api/rooms/create", {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create room");
      } else {
        console.log("Redirecting to room:", data.roomCode);
        window.location.href = `/room/${data.roomCode}`;
      }
    } catch (err) {
      setError("An error occurred");
    } finally {
      setCreatePending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 px-4 py-12 min-h-screen">
      <div className="space-y-6 w-full max-w-md">
        <div className="text-center">
          <h1 className="mb-2 font-bold text-gray-900 text-4xl tracking-tight">
            TypeRacer
          </h1>
          <p className="text-gray-600 text-sm">Welcome, {user.username}!</p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="font-bold text-2xl text-center">Play Now</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block mb-2 font-medium text-sm">
                Join a room
              </label>
              <form onSubmit={handleJoinRoom} className="flex gap-2">
                <Input
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="Room code"
                  maxLength={6}
                  className="uppercase"
                />
                <Button
                  type="submit"
                  disabled={joinPending || !roomCode}
                  size="lg"
                >
                  Join
                </Button>
              </form>
            </div>

            <div className="text-center">
              <span className="text-gray-600 text-sm">or</span>
            </div>

            <Button
              onClick={handleCreateRoom}
              disabled={createPending}
              size="lg"
              className="w-full"
            >
              {createPending ? "Creating..." : "Create Room"}
            </Button>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        <Button
          onClick={handleLogout}
          disabled={isPending}
          variant="outline"
          className="w-full"
        >
          {isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}
