"use client";

import React, { useState, useEffect, useRef, Suspense, use } from "react";
import { useRoomEvents } from "@/hooks/useRoomEvents";
import { useSession } from "@/components/auth/SessionProvider";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function RoomContent({ code }: { code: string }) {
  const { user } = useSession();
  const router = useRouter();
  const [enteredText, setEnteredText] = useState("");
  const [isFinished, setIsFinished] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);
  const [endReason, setEndReason] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [initialRoomData, setInitialRoomData] = useState<any>(null);
  const [roomData, setRoomData] = useState<any>(null);
  const progressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${code}`);
      if (response.ok) {
        const data = await response.json();
        setInitialRoomData(data);
        setLoading(false);
      }
    } catch (err) {
      console.error("Failed to fetch room:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoom();
  }, [code]);

  const { roomData: sseRoomData } = useRoomEvents(code);

  useEffect(() => {
    if (sseRoomData) {
      setRoomData(sseRoomData);
      setLoading(false);

      if (sseRoomData.status === "FINISHED") {
        setGameEnded(true);
        setEndReason("Game ended");
      }

      const myPlayer = sseRoomData.players.find((p: any) => p.userId === user.id);

      if (myPlayer?.isFinished) {
        setIsFinished(true);
      }
    }
  }, [sseRoomData, user.id]);

  const handleTyping = (value: string) => {
    if (isFinished || gameEnded) return;

    setEnteredText(value);

    if (progressTimeoutRef.current) {
      clearTimeout(progressTimeoutRef.current);
    }

    if (roomData?.currentSentence && value === roomData.currentSentence && !isFinished) {
      handleFinish();
      return;
    }

    progressTimeoutRef.current = setTimeout(async () => {
      if (roomData?.currentSentence) {
        const progress = Math.min(value.length, roomData.currentSentence.length);
        
        await fetch(`/api/rooms/${code}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ progress, enteredText: value }),
        });
      }
    }, 300);
  };

  const handleFinish = async () => {
    if (isFinished || gameEnded) return;

    setIsFinished(true);

    try {
      const response = await fetch(`/api/rooms/${code}/finish`, {
        method: "POST",
      });
      const data = await response.json();

      if (data.gameEnded) {
        setGameEnded(true);
        setEndReason(data.reason);
      } else {
        fetchRoom();
      }
    } catch (err) {
      console.error("Failed to finish:", err);
    }
  };

  const handleStartGame = async () => {
    try {
      const response = await fetch(`/api/rooms/${code}/start`, {
        method: "POST",
      });
    } catch (err) {
      console.error("Failed to start game:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading room...</div>
      </div>
    );
  }

  const isOwner = roomData?.owner?.id === user.id;
  const isWaiting = roomData?.status === "WAITING";
  const isPlaying = roomData?.status === "PLAYING";

  const sentence = roomData?.currentSentence || "";
  const progress = enteredText.length;

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-4xl space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Room: {code}</h1>
            <p className="text-sm text-gray-600">
              {isWaiting && "Waiting for players..."}
              {isPlaying && "Race in progress!"}
              {gameEnded && "Race finished!"}
            </p>
          </div>
        </div>

        {isWaiting && isOwner && (
          <Card>
            <CardContent className="pt-6">
              <Button onClick={handleStartGame} size="lg" className="w-full">
                Start Game
              </Button>
            </CardContent>
          </Card>
        )}

        {isPlaying && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-center">Type this sentence:</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-xl sm:text-2xl md:text-2xl lg:text-2xl font-mono leading-relaxed bg-white p-4 sm:p-6 rounded-lg border break-words">
                {sentence.split("").map((char: string, index: number) => {
                  const typedChar = enteredText[index];
                  let className = "text-gray-300";
                  
                  if (typedChar) {
                    className = typedChar === char ? "text-green-600" : "text-red-600 bg-red-100";
                  } else if (index === enteredText.length) {
                    className = "border-b-2 border-blue-500";
                  }
                  
                  return (
                    <span key={index} className={className}>
                      {char === " " ? "\u00A0" : char}
                    </span>
                  );
                })}
              </div>

              <Input
                value={enteredText}
                onChange={(e) => handleTyping(e.target.value)}
                disabled={isFinished || gameEnded}
                placeholder="Start typing..."
                className="text-xl"
                autoFocus
                autoComplete="off"
              />

              {isFinished && (
                <div className="text-center text-green-600 font-bold">
                  You finished! Waiting for others...
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold">Players ({roomData?.players.length || 0})</h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {roomData?.players.map((player: any) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.userId === user.id ? "bg-blue-50" : "bg-white"
                  }`}
                >
                  <div>
                    <span className="font-medium">{player.user.username}</span>
                    {player.userId === user.id && (
                      <span className="ml-2 text-sm text-gray-600">(You)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">
                      {player.progress} chars
                    </span>
                    {player.isFinished && (
                      <span className="text-green-600 font-bold text-sm">✓ Done</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {gameEnded && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-2xl font-bold text-center mb-4">
                {endReason === "all_finished" ? "Race Finished!" : "Time's Up!"}
              </h2>
              <div className="space-y-4">
                {roomData?.players
                  .filter((p: any) => p.isFinished)
                  .sort((a: any, b: any) => (a.finishedAt?.getTime?.() || 0) - (b.finishedAt?.getTime?.() || 0))
                  .map((player: any, index: number) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-lg ${
                        index === 0 ? "bg-yellow-50 border-2 border-yellow-400" : "bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <span className="font-medium text-lg">
                          {player.user.username}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.finishedAt ? new Date(player.finishedAt as string).toLocaleTimeString() : ''}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button onClick={() => router.push("/dashboard")} size="lg">
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

interface RoomPageProps {
  params: Promise<{ code: string }>;
}

export default function RoomPage({ params }: RoomPageProps) {
  const resolvedParams = use(params);
  const code = resolvedParams.code.toUpperCase();
  
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RoomContent code={code} />
    </Suspense>
  );
}
