# TypeRacer - Real-time Typing Competition

Real-time multiplayer typing game built with Next.js, TypeScript, and Server-Sent Events.

## Features Implemented

- Room-based gameplay, create/join rooms
- Real-time synchronization via SSE (works on Vercel)
- Character-by-character typing validation with color feedback
- Live progress tracking for all players (shows number of characters typed)
- Instant finish detection
- Game over rankings with winner highlighting

## Design Choices

**SSE over Websockets**: One-way communication sufficient for game updates, works well on Vercel serverless.

**PostgreSQL + Prisma**: Type-safe ORM

**Lucia Auth**: Lightweight, TypeScript-first, works well with Next.js.

**6-char room codes, 4 players max**: Easy to share, competitive small rooms.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma
- Lucia Auth
- Server-Sent Events (SSE)

**Future Enhancments that could be added**:

- Display open rooms, so entering a code isn't the only way to join a room
- Words Per Minute (WPM) calculation, Accuracy percentage
- Player statistics persistence (games played, wins, averages)
- Monthly leaderboards
- UX improvements like redirecting user from "/" to "/dashboard" when they are logged in

Note: Many features were not implemented due to the 3-hour time limit for this challenge (spent 3h 20min). Prioritized core gameplay and real-time synchronization.Unfortunately significant amount of time went into setting up authentication and resolving conflicting dependency versions, which left less time for core features.

## AI Code Generation

AI assisted with:

- UI components
- Some of the api routes
