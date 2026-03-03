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
      console.log("SSE: No room code, skipping SSE connection");
      return;
    }

    const url = `/api/rooms/${roomCode}/events?roomCode=${roomCode}`;
    console.log("SSE: Connecting to room events for:", roomCode, "URL:", url);
    const eventSource = new EventSource(url);

    eventSource.onopen = () => {
      console.log("SSE: Connected to room events");
      setIsConnected(true);
    };

    const handleMessage = (event: any) => {
      console.log("SSE: Received raw event:", event.data);
      try {
        const data = JSON.parse(event.data);
        console.log("SSE: Parsed event type:", data.type, "data:", data);
        
        if (data.type === "room_state" && data.data) {
          console.log("SSE: Setting room data with", data.data.players?.length, "players");
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
      console.log("SSE: Closing EventSource");
      eventSource.close();
    };
  }, [roomCode]);

  console.log("SSE: Current state - roomData:", roomData, "isConnected:", isConnected);

  return { roomData, isConnected };
}
