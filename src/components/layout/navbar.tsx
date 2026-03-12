'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Menu, X, LogOut, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import type { CurrentUser } from '@/lib/auth'

const publicLinks = [
  { href: '/', label: 'Hjem' },
  { href: '/spots', label: 'Spotter' },
  { href: '/courses', label: 'Kurs' },
] as const

const roleLinks = {
  instructor: { href: '/instructor', label: 'Instruktør' },
  admin: { href: '/admin', label: 'Admin' },
} as const

function roleBadgeLabel(role: string) {
  switch (role) {
    case 'admin':
      return 'Admin'
    case 'instructor':
      return 'Instruktør'
    default:
      return null
  }
}

export function Navbar({ user }: { user: CurrentUser | null }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    setMenuOpen(false)
    router.refresh()
    router.push('/')
  }

  const extraLinks: { href: string; label: string }[] = []
  if (user?.role === 'instructor' || user?.role === 'admin') {
    extraLinks.push(roleLinks.instructor)
  }
  if (user?.role === 'admin') {
    extraLinks.push(roleLinks.admin)
  }

  const allLinks = [...publicLinks, ...extraLinks]

  return (
    <nav className="sticky top-0 z-50 mx-auto w-full max-w-5xl border-b bg-offwhite">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-sky-800">
          Ålesund Kiteklubb
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {allLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-4 py-2 text-base font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}

          {user ? (
            <DesktopUserMenu user={user} onSignOut={handleSignOut} />
          ) : (
            <Link
              href="/login"
              className="ml-2 rounded-md bg-sky-600 px-4 py-2 text-base font-medium text-white transition-colors hover:bg-sky-700"
            >
              Logg inn
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <Button
          variant="ghost"
          size="icon-lg"
          className="md:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Åpne meny"
        >
          <Menu className="size-6" />
        </Button>
      </div>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-offwhite md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link
              href="/"
              className="text-xl font-bold text-sky-800"
              onClick={() => setMenuOpen(false)}
            >
              Ålesund Kiteklubb
            </Link>
            <Button
              variant="ghost"
              size="icon-lg"
              onClick={() => setMenuOpen(false)}
              aria-label="Lukk meny"
            >
              <X className="size-6" />
            </Button>
          </div>

          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-full rounded-lg px-4 py-4 text-center text-2xl font-medium text-foreground transition-colors hover:bg-sky-50 hover:text-sky-600 active:bg-sky-100"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            <div className="my-4 h-px w-16 bg-border" />

            {user ? (
              <div className="flex w-full flex-col items-center gap-4">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <Image
                      src={user.avatarUrl}
                      alt={user.name ?? ''}
                      width={44}
                      height={44}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-full bg-sky-100">
                      <User className="size-6 text-sky-600" />
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-lg font-medium">{user.name ?? user.email}</p>
                    {roleBadgeLabel(user.role) && (
                      <span className="text-sm text-sky-600">
                        {roleBadgeLabel(user.role)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full rounded-lg px-4 py-4 text-center text-xl text-muted-foreground transition-colors hover:bg-sky-50 hover:text-foreground active:bg-sky-100"
                >
                  <span className="inline-flex items-center gap-2">
                    <LogOut className="size-5" />
                    Logg ut
                  </span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="w-full rounded-lg bg-sky-600 px-4 py-4 text-center text-2xl font-medium text-white transition-colors hover:bg-sky-700 active:bg-sky-800"
                onClick={() => setMenuOpen(false)}
              >
                Logg inn
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}

function DesktopUserMenu({
  user,
  onSignOut,
}: {
  user: CurrentUser
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative ml-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-md px-3 py-2 transition-colors hover:bg-accent"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name ?? ''}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-sky-100">
            <User className="size-4 text-sky-600" />
          </div>
        )}
        <span className="text-base font-medium">
          {user.name?.split(' ')[0] ?? 'Bruker'}
        </span>
        {roleBadgeLabel(user.role) && (
          <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-sm font-medium text-sky-700">
            {roleBadgeLabel(user.role)}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-56 rounded-lg border bg-popover p-1 shadow-md">
            <div className="px-3 py-2.5 text-sm text-muted-foreground">
              {user.email}
            </div>
            <div className="h-px bg-border" />
            <button
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-base transition-colors hover:bg-accent"
            >
              <LogOut className="size-4" />
              Logg ut
            </button>
          </div>
        </>
      )}
    </div>
  )
}
