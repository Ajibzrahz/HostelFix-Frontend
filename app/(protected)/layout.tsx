import { AppHeader } from '@/components/app-header'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-slate-50"><AppHeader />{children}</div>
}
