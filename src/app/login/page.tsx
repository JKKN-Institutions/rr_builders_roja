"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, AlertCircle } from "lucide-react";

const MAX_CLIENT_ATTEMPTS = 5;
const CLIENT_LOCKOUT_SECONDS = 30;

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSecondsLeft, setLockoutSecondsLeft] = useState(0);

  const isLockedOut = lockoutSecondsLeft > 0;

  // Countdown timer for client-side lockout
  useEffect(() => {
    if (lockoutSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setLockoutSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSecondsLeft]);

  const startLockout = useCallback((seconds: number) => {
    setLockoutSecondsLeft(seconds);
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (isLockedOut) return;

    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Server returned 429 — use server's Retry-After
        if (response.status === 429) {
          const retryAfter = data.retryAfter || CLIENT_LOCKOUT_SECONDS;
          startLockout(retryAfter);
          setError(`Too many attempts. Try again in ${retryAfter} seconds.`);
          setIsLoading(false);
          return;
        }

        // Track failed attempt for client-side lockout
        const newCount = failedAttempts + 1;
        setFailedAttempts(newCount);

        if (newCount >= MAX_CLIENT_ATTEMPTS) {
          startLockout(CLIENT_LOCKOUT_SECONDS);
          setError(`Too many attempts. Try again in ${CLIENT_LOCKOUT_SECONDS} seconds.`);
          setFailedAttempts(0);
        } else {
          setError(data.error || "Wrong email or password. Please try again.");
        }

        setIsLoading(false);
        return;
      }

      // Success — reset counters and redirect
      setFailedAttempts(0);
      setLockoutSecondsLeft(0);

      const params = new URLSearchParams(window.location.search);
      let redirect = params.get("redirect") || "/dashboard";
      // Prevent open redirect: only allow relative paths on same origin
      if (!redirect.startsWith("/") || redirect.startsWith("//")) {
        redirect = "/dashboard";
      }
      router.push(redirect);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-9 h-9 text-primary-foreground" aria-hidden="true" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold">
              BuildWise <span className="text-accent">Cashflow</span>
            </CardTitle>
            <CardDescription>
              Sign in to access your financial dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Error Message */}
            {error && (
              <div
                className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                role="alert"
                aria-live="polite"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Lockout countdown */}
            {isLockedOut && (
              <div
                className="flex items-center justify-center p-3 rounded-md bg-muted text-muted-foreground text-sm font-medium"
                role="status"
                aria-live="polite"
              >
                Try again in {lockoutSecondsLeft} second{lockoutSecondsLeft !== 1 ? "s" : ""}
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || isLockedOut}
                autoComplete="email"
                autoFocus
                required
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
                className="h-11"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || isLockedOut}
                autoComplete="current-password"
                required
                aria-required="true"
                aria-invalid={error ? "true" : "false"}
                className="h-11"
              />
            </div>

            {/* Forgot Password */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-sm text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                tabIndex={isLoading ? -1 : 0}
              >
                Forgot password?
              </Link>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading || isLockedOut}
              aria-label={
                isLockedOut
                  ? `Login disabled. Try again in ${lockoutSecondsLeft} seconds.`
                  : isLoading
                    ? "Signing in..."
                    : "Sign in to dashboard"
              }
            >
              {isLockedOut
                ? `Locked (${lockoutSecondsLeft}s)`
                : isLoading
                  ? "Signing in..."
                  : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {/* Back to Home */}
      <div className="absolute top-4 left-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-2"
        >
          <Link href="/">
            <span aria-hidden="true">&larr;</span> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
