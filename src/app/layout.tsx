import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { getCurrentUser } from '@/lib/auth'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { ContentCard } from '@/components/layout/content-card'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Ålesund Kiteklubb',
  description:
    'Kiteklubben i Ålesund — kurs, spotter og fellesskap for kitesurfere på Sunnmøre.',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const user = await getCurrentUser()

  return (
    <html lang="nb">
      <body className={`${inter.variable} antialiased`}>
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-sky-100 via-blue-50 to-slate-50" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,190,255,0.15),transparent)]" />

        <div className="relative flex min-h-screen flex-col">
          <Navbar user={user} />
          <ContentCard>{children}</ContentCard>
          <Footer />
        </div>

        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}
