"use server";

import { lucia } from "@/lib/lucia";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { redirect } from "next/navigation";

function hashPassword(password: string): string {
  return crypto
    .createHash("sha256")
    .update(password)
    .digest("hex");
}

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Username and password are required" };
  }

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { error: "Invalid username or password" };
  }

  const hashedPassword = hashPassword(password);

  if (user.password !== hashedPassword) {
    return { error: "Invalid username or password" };
  }

  const session = await lucia.createSession(user.id, {});
  const sessionCookie = lucia.createSessionCookie(session.id);
  (await cookies()).set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.attributes
  );

  revalidatePath("/");
  redirect("/dashboard");
}
