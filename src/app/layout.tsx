import type { Metadata, Viewport } from "next"
import { Syne, Plus_Jakarta_Sans } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Toaster } from "@/components/ui/sonner"
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register"
import {
  getDefaultSiteDescription,
  getSiteUrl,
  SITE_LOGO_PATH,
} from "@/lib/site"

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

const siteUrl = getSiteUrl()
const defaultDescription = getDefaultSiteDescription()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ålesund Kiteklubb",
    template: "%s | Ålesund Kiteklubb",
  },
  description: defaultDescription,
  applicationName: "Ålesund Kiteklubb",
  openGraph: {
    type: "website",
    locale: "nb_NO",
    url: siteUrl,
    siteName: "Ålesund Kiteklubb",
    title: "Ålesund Kiteklubb",
    description: defaultDescription,
    images: [
      {
        url: SITE_LOGO_PATH,
        alt: "Ålesund Kiteklubb",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ålesund Kiteklubb",
    description: defaultDescription,
    images: [SITE_LOGO_PATH],
  },
  appleWebApp: {
    capable: true,
    title: "Ålesund Kiteklubb",
    statusBarStyle: "default",
  },
  icons: {
    apple: [{ url: "/logo-emblem-transparent-square.png", type: "image/png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#132a45",
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
          <main className="flex-1 min-h-0 pt-16">
            <div className="mx-auto w-full max-w-6xl px-4 py-6 md:py-8 h-full min-h-0 overflow-y-auto">
              <div className="rounded-none md:rounded-xl bg-card shadow-lg md:shadow-xl min-h-[60vh]">
                {children}
              </div>
            </div>
          </main>
          <Footer />
        </div>

        <Toaster richColors position="top-right" />
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}
