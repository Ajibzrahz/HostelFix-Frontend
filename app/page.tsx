import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { ServerHealth } from "@/components/server-health";

const features = [
  {
    icon: ClipboardList,
    title: "Easy problem reporting",
    description:
      "Students can submit maintenance requests and describe issues affecting their rooms.",
  },
  {
    icon: LayoutDashboard,
    title: "Centralised management",
    description:
      "Keep maintenance requests organised in one place instead of relying on scattered messages.",
  },
  {
    icon: Bell,
    title: "Progress tracking",
    description:
      "Stay informed as reported issues move from open to assigned, in progress, and resolved.",
  },
  {
    icon: Users,
    title: "Better coordination",
    description:
      "Help students and maintenance staff work together with clearer communication.",
  },
];

const steps = [
  {
    number: "01",
    icon: ClipboardList,
    title: "Report an issue",
    description:
      "Submit a maintenance request with the relevant details about the problem.",
  },
  {
    number: "02",
    icon: Users,
    title: "Staff take action",
    description:
      "The appropriate staff member reviews and handles the maintenance request.",
  },
  {
    number: "03",
    icon: Clock3,
    title: "Track progress",
    description:
      "Follow the progress of your request as the repair work moves forward.",
  },
  {
    number: "04",
    icon: CheckCircle2,
    title: "Confirm resolution",
    description:
      "Keep track of completed repairs and enjoy a better hostel experience.",
  },
];

const sampleTickets = [
  {
    title: "Leaking bathroom tap",
    category: "Plumbing",
    room: "Room 204",
    status: "In progress",
    statusClass: "bg-amber-50 text-amber-700",
    icon: Wrench,
  },
  {
    title: "Faulty ceiling light",
    category: "Electrical",
    room: "Room 108",
    status: "Assigned",
    statusClass: "bg-blue-50 text-blue-700",
    icon: Bell,
  },
  {
    title: "Broken wardrobe handle",
    category: "Furniture",
    room: "Room 312",
    status: "Resolved",
    statusClass: "bg-emerald-50 text-emerald-700",
    icon: CheckCircle2,
  },
];

export default function Page() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f8f9ff] text-slate-950">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <span className="text-lg font-bold tracking-tight">HostelFix</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link
              href="#features"
              className="text-sm font-medium text-slate-600 transition hover:text-[#4f46e5]"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 transition hover:text-[#4f46e5]"
            >
              How it works
            </Link>
            <Link
              href="#about"
              className="text-sm font-medium text-slate-600 transition hover:text-[#4f46e5]"
            >
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden text-sm font-semibold text-slate-700 transition hover:text-[#4f46e5] sm:inline-flex"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#4f46e5] px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
            >
              Get started
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[500px] rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-40 size-[400px] rounded-full bg-teal-100/60 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16 lg:px-12 lg:py-28">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white/80 px-3.5 py-2 text-xs font-semibold text-[#4f46e5] shadow-sm sm:text-sm">
              <span className="size-2 rounded-full bg-teal-500" />
              Hostel maintenance, made simpler
            </div>

            <h1 className="text-4xl font-bold leading-[1.12] tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-6xl">
              A better hostel experience starts with{" "}
              <span className="text-[#4f46e5]">fixing what matters.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Report maintenance problems, track repair progress, and stay
              informed until the issue is resolved. HostelFix brings students
              and hostel management together.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-[#4f46e5] px-6 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-[#4338ca] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2"
              >
                Create an account
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>

              <Link
                href="#how-it-works"
                className="inline-flex h-12 items-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                See how it works
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-600" />
                Simple reporting
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-teal-600" />
                Clear progress updates
              </span>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-200/60 to-teal-100/70 blur-2xl" />

            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-5 shadow-[0_30px_80px_-35px_rgba(49,46,129,0.35)] sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-lg font-bold tracking-tight">
                    Maintenance overview
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Example ticket-management interface
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5]">
                  <LayoutDashboard className="size-5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-6">
                <div className="rounded-2xl bg-indigo-50/80 p-4">
                  <p className="text-xs font-medium text-indigo-700">
                    Sample tickets
                  </p>
                  <p className="mt-2 text-3xl font-bold text-indigo-950">03</p>
                  <p className="mt-1 text-xs text-indigo-700/70">
                    Example data
                  </p>
                </div>

                <div className="rounded-2xl bg-teal-50 p-4">
                  <p className="text-xs font-medium text-teal-700">Workflow</p>
                  <p className="mt-2 text-3xl font-bold text-teal-950">04</p>
                  <p className="mt-1 text-xs text-teal-700/70">
                    Example stages
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    Recent requests
                  </p>
                  <span className="text-xs font-medium text-slate-400">
                    Preview
                  </span>
                </div>

                {sampleTickets.map((ticket) => {
                  const Icon = ticket.icon;

                  return (
                    <div
                      key={ticket.title}
                      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-indigo-100 hover:bg-slate-50"
                    >
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <Icon className="size-4" aria-hidden="true" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-slate-900">
                          {ticket.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {ticket.room} · {ticket.category}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${ticket.statusClass}`}
                      >
                        {ticket.status}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-5 rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
                  <ShieldCheck className="size-4 text-[#4f46e5]" />
                  One place for maintenance requests
                </div>
                <p className="mt-1 text-xs leading-5 text-indigo-900/70">
                  Keep reports organised and make repair progress easier to
                  follow.
                </p>
              </div>
            </div>

            <div className="relative mt-4 flex justify-center">
              <div className="rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm">
                <ServerHealth />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#4f46e5]">
              Why HostelFix?
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              Maintenance management without the confusion.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              A more organised way to report problems, coordinate repairs, and
              keep everyone informed.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-100/50"
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5] transition group-hover:bg-[#4f46e5] group-hover:text-white">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>

                  <h3 className="mt-5 text-base font-bold text-slate-950">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="scroll-mt-24 bg-[#f8f9ff] py-20 sm:py-24"
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-bold uppercase tracking-wider text-[#4f46e5]">
              Simple process
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              From problem to resolution.
            </h2>
            <p className="mt-4 leading-7 text-slate-600">
              HostelFix makes it easier to follow a maintenance request from the
              moment it is reported to its resolution.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div key={step.number} className="relative">
                  <div className="h-full rounded-2xl border border-slate-200 bg-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex size-12 items-center justify-center rounded-xl bg-indigo-50 text-[#4f46e5]">
                        <Icon className="size-5" aria-hidden="true" />
                      </div>
                      <span className="text-2xl font-bold text-indigo-100">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-6 font-bold text-slate-950">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="scroll-mt-24 bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div>
            <span className="text-sm font-bold uppercase tracking-wider text-[#4f46e5]">
              Built for better living
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              A clearer way to handle hostel maintenance.
            </h2>
          </div>

          <div>
            <p className="leading-8 text-slate-600">
              Maintenance problems can disrupt everyday student life. HostelFix
              provides a central place where students can report issues and
              where staff can organise and manage repair requests.
            </p>
            <p className="mt-4 leading-8 text-slate-600">
              The goal is simple: improve communication, make requests easier to
              track, and create a more organised maintenance process.
            </p>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <section className="px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-3xl bg-[#3730a3] px-6 py-14 text-center shadow-xl shadow-indigo-200 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-32 size-80 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 size-80 rounded-full bg-teal-400/20 blur-3xl" />

          <div className="relative mx-auto max-w-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white">
              <ShieldCheck className="size-6" />
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready for a better hostel experience?
            </h2>
            <p className="mt-4 leading-7 text-indigo-100">
              Create your HostelFix account and make maintenance reporting
              simpler.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-bold text-[#3730a3] transition hover:bg-indigo-50"
              >
                Get started
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center rounded-xl border border-white/30 px-6 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between lg:px-12">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#4f46e5] text-white">
              <ShieldCheck className="size-4" />
            </span>
            <span className="font-bold text-slate-950">HostelFix</span>
          </Link>

          <p className="text-sm text-slate-500">
            Making hostel maintenance simpler and more organised.
          </p>

          <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
            <Link href="/login" className="transition hover:text-[#4f46e5]">
              Login
            </Link>
            <Link href="/register" className="transition hover:text-[#4f46e5]">
              Register
            </Link>
          </div>
        </div>

        <div className="border-t border-slate-100 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} HostelFix. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
