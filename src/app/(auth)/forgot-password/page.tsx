"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "next-auth/react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [googleHint, setGoogleHint] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setGoogleHint(false);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!data.ok) {
        const isGoogleAccount = typeof data.error === "string" && data.error.toLowerCase().includes("google");
        if (isGoogleAccount) {
          setGoogleHint(true);
        } else {
          toast.error(data.error ?? "Something went wrong. Please try again.");
        }
      } else {
        setSent(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Check your email</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          We've sent a reset link to{" "}
          <span className="font-medium text-foreground">{email}</span>. It expires in 1 hour.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          Didn't receive it? Check your spam folder, or{" "}
          <button
            onClick={() => setSent(false)}
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            try again
          </button>
          .
        </p>
        <div className="mt-8">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            ← Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  if (googleHint) {
    return (
      <div>
        <h1 className="font-serif text-3xl">Google account</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The account for <span className="font-medium text-foreground">{email}</span> was created
          with Google. You don't need a password — just sign in with Google.
        </p>
        <div className="mt-6 space-y-3">
          <Button className="w-full" size="lg" onClick={() => signIn("google", { callbackUrl: "/" })}>
            Continue with Google
          </Button>
          <button
            onClick={() => setGoogleHint(false)}
            className="w-full text-sm text-muted-foreground underline-offset-4 hover:underline"
          >
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl">Forgot your password?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send you a link to reset it.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? "Sending..." : "Send reset link"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remember it?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
