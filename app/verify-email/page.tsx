"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Loader2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

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
        setMessage(
          "This verification link is incomplete or invalid. Please request a new one.",
        );
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
              "Your email has been verified successfully. You can now log in.",
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
    <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_20px_60px_-30px_rgba(8,127,140,0.35)] sm:p-9">
      <Link href="/" className="mb-9 inline-flex items-center gap-2">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#087f8c] text-white">
          <ShieldCheck className="size-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-slate-950">
          HostelFix
        </span>
      </Link>

      <div className="flex justify-center">
        {status === "loading" && (
          <div className="flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
            <Loader2 className="size-8 animate-spin" />
          </div>
        )}

        {status === "success" && (
          <div className="flex size-16 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
            <CheckCircle2 className="size-9" />
          </div>
        )}

        {status === "error" && (
          <div className="flex size-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <XCircle className="size-9" />
          </div>
        )}
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[#087f8c]">
        Account verification
      </p>

      <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {status === "loading"
          ? "Verifying your email"
          : status === "success"
            ? "Email verified!"
            : "Verification failed"}
      </h1>

      <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>

      {status === "success" && (
        <Link
          href="/login"
          className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f8c] text-sm font-semibold text-white transition hover:bg-[#066b76]"
        >
          Continue to login
          <ArrowRight className="size-4" />
        </Link>
      )}

      {status === "error" && (
        <Link
          href="/login"
          className="mt-7 flex h-12 w-full items-center justify-center rounded-xl bg-[#087f8c] text-sm font-semibold text-white transition hover:bg-[#066b76]"
        >
          Back to login
        </Link>
      )}

      {status === "loading" && (
        <p className="mt-7 text-xs text-slate-400">
          Please wait while we confirm your email address.
        </p>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_right,_#dff7f4,_transparent_36%),#f7fbfc] px-4 py-10">
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-sm">
            <Loader2 className="mx-auto size-8 animate-spin text-[#087f8c]" />
            <h1 className="mt-5 text-xl font-bold text-slate-950">
              Loading verification...
            </h1>
            <p className="mt-2 text-sm text-slate-500">Please wait.</p>
          </div>
        }
      >
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}
