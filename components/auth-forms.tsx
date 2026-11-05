"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Mail,
  CheckCircle2,
} from "lucide-react";

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

type FormProps = {
  label: string;
  children: React.ReactNode;
  error?: string;
};

function Field({ label, children, error }: FormProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {children}
      {error && (
        <span className="block text-xs font-medium text-red-600">{error}</span>
      )}
    </label>
  );
}

const inputClass =
  "h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#087f8c] focus:bg-white focus:ring-4 focus:ring-teal-50";

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_right,_#dff7f4,_transparent_36%),#f7fbfc] px-5 py-10 sm:px-8">
      <div className="pointer-events-none absolute -left-24 top-1/3 size-72 rounded-full bg-teal-100/40 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-[#087f8c] text-white shadow-lg shadow-teal-900/10">
            <ShieldCheck className="size-6" aria-hidden="true" />
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
              Secure account access
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              {title}
            </h1>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          {children}
        </section>

        <p className="mt-6 text-center text-xs text-slate-400">
          HostelFix · Making hostel maintenance simpler.
        </p>
      </div>
    </main>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <div
      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      role="alert"
    >
      <span className="mt-0.5 size-2 shrink-0 rounded-full bg-red-500" />
      <span>{message}</span>
    </div>
  );
}

function PasswordInput({
  registration,
  visible,
  onToggle,
  autoComplete,
  placeholder = "Enter your password",
}: {
  registration: ReturnType<ReturnType<typeof useForm>["register"]>;
  visible: boolean;
  onToggle: () => void;
  autoComplete: string;
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <input
        {...registration}
        className={`${inputClass} pr-12`}
        type={visible ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
      />

      <button
        type="button"
        onClick={onToggle}
        className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-800"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? (
          <EyeOff className="size-5" aria-hidden="true" />
        ) : (
          <Eye className="size-5" aria-hidden="true" />
        )}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
        <Field
          label="Email address"
          error={form.formState.errors.email?.message}
        >
          <input
            className={inputClass}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...form.register("email")}
          />
        </Field>

        <Field label="Password" error={form.formState.errors.password?.message}>
          <PasswordInput
            registration={form.register("password")}
            visible={showPassword}
            onToggle={() => setShowPassword((previous) => !previous)}
            autoComplete="current-password"
          />
        </Field>

        {error && <FormError message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f8c] text-sm font-semibold text-white shadow-sm transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Logging in...
            </>
          ) : (
            <>
              Log in
              <ArrowRight className="size-4" />
            </>
          )}
        </button>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5 text-sm">
          <Link
            href="/register"
            className="font-semibold text-[#087f8c] transition hover:text-[#066b76] hover:underline"
          >
            Create an account
          </Link>

          <Link
            href="/register?resend=1"
            className="text-slate-500 transition hover:text-slate-900"
          >
            Resend verification
          </Link>
        </div>
      </form>
    </AuthShell>
  );
}

export function RegisterForm() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

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
      await api("/api/v1/auth/register", {
        method: "POST",
        body: values,
      });

      setSuccess(true);
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
      title={success ? "Check your inbox" : "Create your account"}
      description={
        success
          ? "One more step before you can start using HostelFix."
          : "Create an account to report hostel issues and follow their progress."
      }
    >
      {success ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center rounded-2xl border border-teal-200 bg-teal-50 px-5 py-8 text-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-white text-[#087f8c] shadow-sm">
              <Mail className="size-7" />
            </div>

            <h2 className="mt-4 text-lg font-bold text-slate-950">
              Verify your email
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Your account has been created. Check your email for the
              verification link before logging in.
            </p>
          </div>

          <div className="flex items-start gap-2 text-xs leading-5 text-slate-500">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[#087f8c]" />
            Your account will be ready once your email address is verified.
          </div>

          <Link
            href="/login"
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#087f8c] text-sm font-semibold text-white transition hover:bg-[#066b76]"
          >
            Go to login
            <ArrowRight className="size-4" />
          </Link>
        </div>
      ) : (
        <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
          <Field label="Full name" error={form.formState.errors.name?.message}>
            <input
              className={inputClass}
              autoComplete="name"
              placeholder="Enter your full name"
              {...form.register("name")}
            />
          </Field>

          <Field
            label="Email address"
            error={form.formState.errors.email?.message}
          >
            <input
              className={inputClass}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...form.register("email")}
            />
          </Field>

          <Field
            label="Password"
            error={form.formState.errors.password?.message}
          >
            <PasswordInput
              registration={form.register("password")}
              visible={showPassword}
              onToggle={() => setShowPassword((previous) => !previous)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </Field>

          <Field
            label="Confirm password"
            error={form.formState.errors.passwordConfirmation?.message}
          >
            <PasswordInput
              registration={form.register("passwordConfirmation")}
              visible={showPasswordConfirmation}
              onToggle={() =>
                setShowPasswordConfirmation((previous) => !previous)
              }
              autoComplete="new-password"
              placeholder="Re-enter your password"
            />
          </Field>

          {error && <FormError message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#087f8c] text-sm font-semibold text-white shadow-sm transition hover:bg-[#066b76] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                Create account
                <ArrowRight className="size-4" />
              </>
            )}
          </button>

          <p className="border-t border-slate-100 pt-5 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold text-[#087f8c] transition hover:text-[#066b76]"
            >
              Log in
            </Link>
          </p>
        </form>
      )}
    </AuthShell>
  );
}
