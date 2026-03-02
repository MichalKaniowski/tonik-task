import { SessionProvider } from "@/components/auth/SessionProvider";
import { validateRequest } from "@/lib/lucia";
import type React from "react";
import "../globals.css";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await validateRequest();

  return <SessionProvider value={session}>{children}</SessionProvider>;
}
