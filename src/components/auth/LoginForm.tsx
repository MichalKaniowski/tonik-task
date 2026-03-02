"use client";

import { useState, useTransition } from "react";
import { login } from "@/features/auth/actions/login";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setError("");
    
    startTransition(async () => {
      const result = await login(formData);
      
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
            TypeRacer
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Real-time typing competition
          </p>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">Login</h2>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                />
              </div>
              {error && (
                <div className="text-destructive text-sm">{error}</div>
              )}
              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full"
              >
                {isPending ? "Logging in..." : "Login"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm">
              Don't have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={onSwitchToRegister}
              >
                Register
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
