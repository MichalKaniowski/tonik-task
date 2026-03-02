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

export interface RegisterState {
  error?: string;
  username?: string;
}

export async function register(
  prevState: RegisterState | null,
  formData: FormData
): Promise<RegisterState> {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!username || !password) {
    return {
      error: "Username and password are required",
      username,
    };
  }

  if (username.length < 3) {
    return {
      error: "Username must be at least 3 characters",
      username,
    };
  }

  if (password.length < 6) {
    return {
      error: "Password must be at least 6 characters",
      username,
    };
  }

  if (password !== confirmPassword) {
    return {
      error: "Passwords do not match",
      username,
    };
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  });

  if (existingUser) {
    return {
      error: "Username already exists",
      username,
    };
  }

  const hashedPassword = hashPassword(password);

  const user = await prisma.user.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

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
