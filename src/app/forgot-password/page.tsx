"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Mail } from "lucide-react";
import { toast } from "sonner";

/**
 * Forgot Password Page Component
 * Supabase password reset via email
 * Mobile-responsive with construction theme
 * Includes accessibility features (ARIA labels, keyboard navigation)
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email) {
      toast.error("Please enter your email address");
      setIsLoading(false);
      return;
    }

    if (!email.includes("@")) {
      toast.error("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/login",
      });

      if (error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
      }

      toast.success(`Password reset link sent to ${email}`);
      setEmail("");
      setIsLoading(false);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
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
              Reset Your Password
            </CardTitle>
            <CardDescription>
              Enter your email address and we&apos;ll send you a link to reset your password
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  autoFocus
                  required
                  aria-required="true"
                  className="h-11 pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11"
              disabled={isLoading}
              aria-label={isLoading ? "Sending reset link..." : "Send password reset link"}
            >
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            {/* Back to Login Link */}
            <div className="text-center text-sm">
              <span className="text-muted-foreground">Remember your password? </span>
              <Link
                href="/login"
                className="text-accent hover:underline focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 rounded"
                tabIndex={isLoading ? -1 : 0}
              >
                Back to Login
              </Link>
            </div>

            {/* Help text */}
            <div className="text-center text-xs text-muted-foreground border-t border-border pt-4 w-full">
              <p>Check your inbox and spam folder for the reset link.</p>
            </div>
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
            <span aria-hidden="true">←</span> Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
