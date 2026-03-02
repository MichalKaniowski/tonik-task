"use client";

import { useActionState } from "react";
import { register, RegisterState } from "@/features/auth/actions/register";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState<RegisterState | null, FormData>(
    register,
    null
  );

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
            <h2 className="text-2xl font-semibold text-gray-900">
              Sign up
            </h2>
          </CardHeader>

          <CardContent>
            <form action={formAction} className="space-y-6">
              {state?.error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-md text-sm">
                  {state.error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium">
                  Username
                </label>
                <Input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={state?.username}
                  autoComplete="username"
                  required
                  minLength={3}
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
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                size="lg"
                className="w-full"
              >
                {isPending ? "Creating account..." : "Sign up"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Button
                type="button"
                variant="link"
                className="h-auto p-0"
                onClick={onSwitchToLogin}
              >
                Sign in
              </Button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
