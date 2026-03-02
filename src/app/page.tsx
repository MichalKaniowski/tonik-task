"use client";

import { LoginForm } from "@/components/auth/LoginForm";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useNonRequiredSession } from "@/components/auth/SessionProvider";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const session = useNonRequiredSession();
  const router = useRouter();

  if (session?.user) {
    router.push("/dashboard");
  }

  return isLogin ? (
    <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
  ) : (
    <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
  );
}
