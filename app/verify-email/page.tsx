"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { api, ApiError } from "@/lib/api";

type VerificationStatus = "loading" | "success" | "error";

function VerifyEmailContent() {
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<VerificationStatus>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let active = true;

    async function verifyEmail() {
      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link. Please request a new one.");
        return;
      }

      try {
        const query = new URLSearchParams({ token, email });

        const result = await api<{ message: string }>(
          `/api/v1/auth/verify-email?${query.toString()}`,
        );

        if (active) {
          setStatus("success");
          setMessage(
            result?.message ??
              "Email verified successfully. You can now log in.",
          );
        }
      } catch (error) {
        if (active) {
          setStatus("error");
          setMessage(
            error instanceof ApiError
              ? error.message
              : "Something went wrong while verifying your email.",
          );
        }
      }
    }

    void verifyEmail();

    return () => {
      active = false;
    };
  }, [token, email]);

  return (
    <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
      <div className="mb-4 text-3xl">
        {status === "loading" && "⏳"}
        {status === "success" && "✓"}
        {status === "error" && "✕"}
      </div>

      <h1 className="mb-3 text-2xl font-semibold text-slate-900">
        {status === "loading"
          ? "Verifying your email"
          : status === "success"
            ? "Email verified"
            : "Verification failed"}
      </h1>

      <p className="mb-6 text-sm text-slate-600">{message}</p>

      {status === "success" && (
        <Link
          href="/login"
          className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700"
        >
          Continue to login
        </Link>
      )}

      {status === "error" && (
        <Link
          href="/login"
          className="inline-flex rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700"
        >
          Back to login
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-sm">
            <div className="mb-4 text-3xl">⏳</div>
            <h1 className="mb-3 text-2xl font-semibold text-slate-900">
              Loading verification...
            </h1>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
