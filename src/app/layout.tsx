import type { Metadata, Viewport } from "next"
import { Syne, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  display: "swap",
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Ålesund Kiteklubb",
  description: "Kiteklubben for Sunnmøre — Kurs, spotter og fellesskap",
  openGraph: {
    title: "Ålesund Kiteklubb",
    description: "Kiteklubben for Sunnmøre — Kurs, spotter og fellesskap",
    type: "website",
  },
}

export const viewport: Viewport = {
  themeColor: "#0d7377",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="no">
      <body className={`${syne.variable} ${jakarta.variable} font-sans antialiased`}>
        {/* Fixed background image */}
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/kite-beach-bg.jpg')" }}
        />

        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1 pt-16">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8">
              <div className="rounded-none md:rounded-xl bg-card shadow-lg md:shadow-xl min-h-[60vh]">
                {children}
              </div>
            </div>
          </main>
          <Footer />
        </div>

        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
