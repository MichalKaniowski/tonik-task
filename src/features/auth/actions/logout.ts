"use server";

import { lucia } from "@/lib/lucia";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
  const sessionId = (await cookies()).get(lucia.sessionCookieName)?.value ?? null;

  if (sessionId) {
    await lucia.invalidateSession(sessionId);
  }

  const sessionCookie = lucia.createBlankSessionCookie();
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  revalidatePath("/");
  redirect("/");
}
