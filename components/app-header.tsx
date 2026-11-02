'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, ShieldCheck, Ticket, Wrench } from 'lucide-react'
import { useAuth } from '@/components/auth-provider'

export function AppHeader() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/tickets" className="flex items-center gap-3" aria-label="HostelFix tickets">
          <span className="flex size-9 items-center justify-center rounded-xl bg-[#087f8c] text-white"><ShieldCheck className="size-5" aria-hidden="true" /></span>
          <span className="font-bold tracking-tight text-slate-950">HostelFix</span>
        </Link>
        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main navigation">
          <Link href="/dashboard" className={`rounded-lg px-3 py-2 text-sm font-medium ${pathname.startsWith('/dashboard') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}><LayoutDashboard className="mr-2 inline size-4" aria-hidden="true" />Overview</Link>
          <Link href="/tickets" className={`rounded-lg px-3 py-2 text-sm font-medium ${pathname.startsWith('/tickets') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}><Ticket className="mr-2 inline size-4" aria-hidden="true" />Tickets</Link>
          {(user?.role === 'admin' || user?.role === 'staff') && <Link href="/hostels" className={`rounded-lg px-3 py-2 text-sm font-medium ${pathname.startsWith('/hostels') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}><Wrench className="mr-2 inline size-4" aria-hidden="true" />Hostels</Link>}
        </nav>
        <nav className="order-3 flex w-full items-center gap-1 overflow-x-auto border-t border-slate-100 pt-3 sm:hidden" aria-label="Mobile navigation">
          <Link href="/dashboard" className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${pathname.startsWith('/dashboard') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}>Overview</Link>
          <Link href="/tickets" className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${pathname.startsWith('/tickets') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}>Tickets</Link>
          {(user?.role === 'admin' || user?.role === 'staff') && <Link href="/hostels" className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold ${pathname.startsWith('/hostels') ? 'bg-[#ecfbf9] text-[#087f8c]' : 'text-slate-600 hover:bg-slate-50'}`}>Hostels</Link>}
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-slate-900">{user?.name}</p><p className="text-xs capitalize text-slate-500">{user?.role}</p></div>
          <button onClick={signOut} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50" aria-label="Log out"><LogOut className="size-4" aria-hidden="true" /></button>
        </div>
      </div>
    </header>
  )
}
