"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/components/auth-provider";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
});
const registerSchema = z
  .object({
    name: z.string().min(1, "Enter your name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Use at least 8 characters"),
    passwordConfirmation: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "Passwords do not match",
  });

type FormProps = { label: string; children: React.ReactNode; error?: string };
function Field({ label, children, error }: FormProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-slate-800">{label}</span>
      {children}
      {error && <span className="block text-xs text-red-600">{error}</span>}
    </label>
  );
}
const inputClass =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:ring-2 focus:ring-[#087f8c]/20";

function AuthShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#dff7f4,_transparent_36%),#f7fbfc] px-5 py-8 sm:px-8">
      <div className="mx-auto max-w-md">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-[#087f8c] text-white">
            <ShieldCheck className="size-5" aria-hidden="true" />
          </span>
          <span className="font-bold tracking-tight text-slate-950">
            HostelFix
          </span>
        </Link>
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-30px_rgba(8,127,140,0.35)] sm:p-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          {children}
        </section>
      </div>
    </main>
  );
}
function FormError({ message }: { message: string }) {
  return (
    <div
      className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
      role="alert"
    >
      {message}
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function submit(values: z.infer<typeof loginSchema>) {
    setLoading(true);
    setError("");

    try {
      await api("/api/v1/auth/login", {
        method: "POST",
        body: values,
      });

      const authenticatedUser = await refreshUser();

      if (!authenticatedUser) {
        throw new Error(
          "Login succeeded, but we could not retrieve your account information.",
        );
      }

      router.replace("/tickets");
    } catch (cause) {
      setError(
        cause instanceof ApiError && cause.code === "EMAIL_NOT_VERIFIED"
          ? "Please verify your email before logging in."
          : cause instanceof Error
            ? cause.message
            : "Unable to log in right now.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Welcome back"
      description="Log in to report a problem or track a repair."
    >
      <form className="mt-7 space-y-5" onSubmit={form.handleSubmit(submit)}>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
        </Field>

        <Field label="Password" error={form.formState.errors.password?.message}>
          <input
            className={inputClass}
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
        </Field>

        {error && <FormError message={error} />}

        <button
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#087f8c] text-sm font-semibold text-white hover:bg-[#066b76] disabled:opacity-60"
        >
          {loading && (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          )}
          Log in
        </button>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/register"
            className="font-semibold text-[#087f8c] hover:underline"
          >
            Create an account
          </Link>

          <Link
            href="/register?resend=1"
            className="text-slate-500 hover:text-slate-900"
          >
            Resend verification
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}
export function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      passwordConfirmation: "",
    },
  });
  async function submit(values: z.infer<typeof registerSchema>) {
    setLoading(true);
    setError("");
    try {
      await api("/api/v1/auth/register", { method: "POST", body: values });
      setSuccess("Check your email to verify your account.");
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to create your account right now.",
      );
    } finally {
      setLoading(false);
    }
  }
  return (
    <AuthShell
      title="Create your account"
      description="Use your university email to get started."
    >
      {success ? (
        <div className="mt-7 space-y-4">
          <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-3 text-sm text-teal-800">
            {success}
          </div>
          <Link
            href="/login"
            className="flex h-11 items-center justify-center rounded-lg bg-[#087f8c] text-sm font-semibold text-white"
          >
            Go to login
          </Link>
        </div>
      ) : (
        <form className="mt-7 space-y-5" onSubmit={form.handleSubmit(submit)}>
          <Field label="Name" error={form.formState.errors.name?.message}>
            <input
              className={inputClass}
              autoComplete="name"
              {...form.register("name")}
            />
          </Field>
          <Field label="Email" error={form.formState.errors.email?.message}>
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              {...form.register("email")}
            />
          </Field>
          <Field
            label="Password"
            error={form.formState.errors.password?.message}
          >
            <input
              className={inputClass}
              type="password"
              autoComplete="new-password"
              {...form.register("password")}
            />
          </Field>
          <Field
            label="Confirm password"
            error={form.formState.errors.passwordConfirmation?.message}
          >
            <input
              className={inputClass}
              type="password"
              autoComplete="new-password"
              {...form.register("passwordConfirmation")}
            />
          </Field>
          {error && <FormError message={error} />}
          <button
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#087f8c] text-sm font-semibold text-white hover:bg-[#066b76] disabled:opacity-60"
          >
            {loading && (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            )}
            Create account
          </button>
          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#087f8c]">
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
