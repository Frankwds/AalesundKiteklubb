"use client"

import dynamic from "next/dynamic"
import type { CurrentUser } from "@/lib/auth"

const NavbarClient = dynamic(
  () => import("./navbar-client").then((mod) => mod.NavbarClient),
  {
    ssr: false,
    loading: () => (
      <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
        <nav className="mx-auto max-w-6xl px-4 h-16" />
      </header>
    ),
  }
)

export function NavbarClientLoader({ user }: { user: CurrentUser | null }) {
  return <NavbarClient user={user} />
}
