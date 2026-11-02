import Link from 'next/link'
import { ArrowRight, CheckCircle2, ClipboardCheck, ShieldCheck, Wrench } from 'lucide-react'
import { ServerHealth } from '@/components/server-health'

const steps = [
  { label: 'Report a problem', icon: ClipboardCheck },
  { label: 'Staff pick it up', icon: Wrench },
  { label: 'You confirm the fix', icon: CheckCircle2 },
]

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,_#e8e7ff,_transparent_38%),radial-gradient(circle_at_bottom_left,_#dff8f3,_transparent_32%),linear-gradient(180deg,_#f8f9ff_0%,_#ffffff_58%)] text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#4f46e5] text-white shadow-sm">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">HostelFix</p>
              <p className="text-xs text-slate-500">A better way to get things fixed</p>
            </div>
          </div>
          <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-600">Phase 1</span>
        </header>

        <section className="flex flex-1 items-center py-16 lg:py-24">
          <div className="grid w-full gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="max-w-2xl">
              <p className="mb-5 inline-flex items-center rounded-full border border-[#a9e4df] bg-[#ecfbf9] px-3 py-1 text-sm font-semibold text-[#4f46e5]">
                Maintenance made simple
              </p>
              <h1 className="max-w-xl text-4xl font-bold tracking-[-0.04em] text-slate-950 sm:text-6xl sm:leading-[1.02]">
                Spot it. Report it. <span className="text-[#4f46e5]">Fix it.</span>
              </h1>
              <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
                HostelFix helps students report maintenance problems and keeps everyone in the loop until they are resolved.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/login" className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#4f46e5] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#066b76] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2">
                  Log in <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <Link href="/register" className="inline-flex h-11 items-center rounded-lg border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Create account</Link>
                <span className="text-sm text-slate-500">Your account and tickets stay secure.</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_-30px_rgba(8,127,140,0.35)] backdrop-blur sm:p-8">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Connection status</p>
                  <p className="mt-1 text-sm text-slate-500">Checking the HostelFix backend</p>
                </div>
                <div className="rounded-xl bg-[#ecfbf9] p-2.5 text-[#4f46e5]"><ServerHealth /></div>
              </div>
              <div className="space-y-5 pt-7">
                {steps.map(({ label, icon: Icon }, index) => (
                  <div className="flex items-center gap-4" key={label}>
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#4f46e5]">
                      <Icon className="size-5" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">{label}</p>
                      <div className="mt-2 h-1.5 rounded-full bg-slate-100">
                        <div className={`h-1.5 rounded-full bg-[#72cbc3] ${index === 0 ? 'w-4/5' : index === 1 ? 'w-3/5' : 'w-2/5'}`} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-8 rounded-xl bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-500">
                The first request may take up to a minute while the free backend wakes up. This screen will update automatically when it responds.
              </p>
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200/80 py-5 text-xs text-slate-500">
          Built for calmer, clearer hostel maintenance.
        </footer>
      </div>
    </main>
  )
}
