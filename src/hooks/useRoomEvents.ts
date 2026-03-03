"use client";

import { useEffect, useState, useCallback } from "react";

export interface RoomData {
  roomCode: string;
  status: string;
  currentSentence: string | null;
  owner: {
    id: string;
    username: string;
  };
  players: Array<{
    id: string;
    userId: string;
    progress: number;
    isFinished: boolean;
    enteredText: string;
    finishedAt: Date | null;
    user: {
      id: string;
      username: string;
    };
  }>;
}

export function useRoomEvents(roomCode: string) {
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!roomCode || roomCode.length === 0) {
      return;
    }

    const url = `/api/rooms/${roomCode}/events?roomCode=${roomCode}`;
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    const handleMessage = (event: any) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "room_state" && data.data) {
          setRoomData(data.data);
        }
      } catch (e) {
        console.error("SSE: Error parsing event:", e);
      }
    };

    eventSource.addEventListener("message", handleMessage);
    eventSource.addEventListener("room_state", handleMessage);

    eventSource.onerror = (error) => {
      console.error("SSE: EventSource error:", error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
    };
  }, [roomCode]);

  return { roomData, isConnected };
}
