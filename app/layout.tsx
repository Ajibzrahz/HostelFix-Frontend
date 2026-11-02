import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/auth-provider'
import { QueryProvider } from '@/components/query-provider'

export const metadata: Metadata = {
  title: 'HostelFix',
  description: 'Report and track hostel maintenance problems.',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><QueryProvider><AuthProvider>{children}</AuthProvider></QueryProvider></body></html>
}
