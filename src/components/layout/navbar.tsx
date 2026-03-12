'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, X, LogOut, User, Wind } from 'lucide-react'
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
  const pathname = usePathname()

  function closeMenu() {
    setMenuOpen(false)
  }

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    closeMenu()
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
    <>
      <nav className="sticky top-0 z-40 w-full border-b border-white/20 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-sky-800 transition-opacity hover:opacity-80"
          >
            <Wind className="size-6" />
            <span>Ålesund Kiteklubb</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            {allLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? 'bg-sky-50 text-sky-700'
                    : 'text-foreground/70 hover:bg-sky-50/50 hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {user ? (
              <DesktopUserMenu user={user} onSignOut={handleSignOut} />
            ) : (
              <Link
                href="/login"
                className="ml-2 inline-flex h-9 items-center rounded-lg bg-sky-600 px-4 text-sm font-medium text-white shadow-sm transition-all hover:bg-sky-700 hover:shadow-md active:scale-[0.98]"
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
      </nav>

      {/* Mobile full-screen overlay — rendered outside nav to avoid containment issues */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white/95 backdrop-blur-xl md:hidden">
            <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xl font-bold tracking-tight text-sky-800"
                onClick={closeMenu}
              >
                <Wind className="size-6" />
                <span>Ålesund Kiteklubb</span>
              </Link>
              <Button
                variant="ghost"
                size="icon-lg"
                onClick={closeMenu}
                aria-label="Lukk meny"
              >
                <X className="size-6" />
              </Button>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center gap-1 px-6">
              {allLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`w-full rounded-xl px-4 py-4 text-center text-xl font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-sky-50 text-sky-700'
                      : 'text-foreground/80 hover:bg-sky-50 hover:text-sky-700 active:bg-sky-100'
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}

              <div className="my-3 h-px w-12 bg-gray-200" />

              {user ? (
                <div className="flex w-full flex-col items-center gap-4">
                  <div className="flex items-center gap-3">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name ?? ''}
                        width={44}
                        height={44}
                        className="rounded-full ring-2 ring-sky-100"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-full bg-sky-100">
                        <User className="size-6 text-sky-600" />
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-lg font-medium">
                        {user.name ?? user.email}
                      </p>
                      {roleBadgeLabel(user.role) && (
                        <span className="text-sm font-medium text-sky-600">
                          {roleBadgeLabel(user.role)}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full rounded-xl px-4 py-4 text-center text-lg text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-600 active:bg-red-100"
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
                  className="w-full rounded-xl bg-sky-600 px-4 py-4 text-center text-xl font-medium text-white shadow-sm transition-all hover:bg-sky-700 active:scale-[0.98]"
                  onClick={closeMenu}
                >
                  Logg inn
                </Link>
              )}
            </div>
        </div>
      )}
    </>
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
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-sky-50/50"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.name ?? ''}
            width={32}
            height={32}
            className="rounded-full ring-2 ring-sky-100"
          />
        ) : (
          <div className="flex size-8 items-center justify-center rounded-full bg-sky-100">
            <User className="size-4 text-sky-600" />
          </div>
        )}
        <span className="text-sm font-medium">
          {user.name?.split(' ')[0] ?? 'Bruker'}
        </span>
        {roleBadgeLabel(user.role) && (
          <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700">
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
          <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg shadow-gray-200/50">
            <div className="px-3 py-2 text-sm text-muted-foreground">
              {user.email}
            </div>
            <div className="mx-2 h-px bg-gray-100" />
            <button
              onClick={() => {
                setOpen(false)
                onSignOut()
              }}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
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
