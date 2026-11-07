"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Mail, ShieldCheck } from "lucide-react";

import { ResendVerificationForm } from "@/components/auth-forms";

function ResendVerificationContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_#dff7f4,_transparent_36%),#f7fbfc] px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#087f8c] text-white shadow-lg shadow-teal-900/10">
            <ShieldCheck className="size-6" />
          </span>

          <span>
            <span className="block text-lg font-bold tracking-tight text-slate-950">
              HostelFix
            </span>
            <span className="block text-xs text-slate-500">
              Hostel maintenance made easier
            </span>
          </span>
        </Link>

        <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(8,127,140,0.35)] sm:p-8">
          <div className="mb-7">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1.5 text-xs font-semibold text-[#087f8c]">
              <ShieldCheck className="size-3.5" />
              Account verification
            </div>

            <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-[#087f8c]">
              <Mail className="size-7" />
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Resend verification email
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Didn't receive your verification email? Enter your registered
              email address below and we'll help you request another link.
            </p>
          </div>

          <ResendVerificationForm initialEmail={email} />

          <div className="mt-6 border-t border-slate-100 pt-5">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-semibold text-[#087f8c] transition hover:text-[#066b76]"
            >
              <ArrowLeft className="size-4" />
              Back to login
            </Link>
          </div>
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          HostelFix · Making hostel maintenance simpler.
        </p>
      </div>
    </main>
  );
}

export default function ResendVerificationPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7fbfc]">
          <div className="text-sm font-medium text-slate-500">Loading...</div>
        </main>
      }
    >
      <ResendVerificationContent />
    </Suspense>
  );
}
