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
        {/* Panorama background — replace gradient with real image later */}
        <div className="fixed inset-0 -z-10 bg-gradient-to-b from-sky-200 via-sky-100 to-sky-50" />

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
