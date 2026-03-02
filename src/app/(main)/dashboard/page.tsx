"use client";

import { useSession } from "@/components/auth/SessionProvider";
import { logout } from "@/features/auth/actions/logout";
import { useTransition } from "react";

export default function DashboardPage() {
  const session = useSession();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logout();
    });
  };

  if (!session?.user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-center items-center bg-gray-50 min-h-screen">
      <div className="text-center">
        <h1 className="mb-4 font-bold text-3xl">
          Welcome, {session.user.username}!
        </h1>
        <p className="mb-6 text-gray-600">You are now logged in.</p>
        <button
          onClick={handleLogout}
          disabled={isPending}
          className="bg-red-500 hover:bg-red-600 disabled:opacity-50 px-6 py-2 rounded-md text-white disabled:cursor-not-allowed"
        >
          {isPending ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
