"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { buttonVariants } from "@/components/ui/button-variants"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from "@/components/ui/sheet"
import { signOut } from "@/lib/actions/auth"
import { showCoursePages } from "@/lib/feature-flags"
import { cn } from "@/lib/utils"
import type { CurrentUser } from "@/lib/auth"

const roleLabels: Record<string, string> = {
  user: "Bruker",
  instructor: "Instruktør",
  admin: "Admin",
}

const roleBadgeVariants = {
  user: "neutral" as const,
  instructor: "primarySoft" as const,
  admin: "warning" as const,
}

function getInitials(name: string | null): string {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

interface NavbarClientProps {
  user: CurrentUser | null
}

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navLinks = [
    { href: "/", label: "Hjem" },
    { href: "/spots", label: "Spot guide" },
    ...(showCoursePages ? [{ href: "/courses" as const, label: "Kurs" }] : []),
  ]

  const roleLinks: { href: string; label: string }[] = []
  if (user && (user.role === "instructor" || user.role === "admin")) {
    roleLinks.push({ href: "/instructor", label: "Instruktør" })
  }
  if (user && user.role === "admin") {
    roleLinks.push({ href: "/admin", label: "Admin" })
  }

  async function handleSignOut() {
    await signOut()
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border/50">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="-ml-4 flex items-center gap-1 font-display font-bold text-lg tracking-tight text-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
          aria-label="Gå til forsiden"
        >
          <Image
            src="/logo-emblem-transparent.png"
            alt=""
            width={100}
            height={100}
            className="shrink-0"
          />
          Ålesund Kiteklubb
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 px-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "text-primary bg-primary-muted/60"
                    : "text-foreground/80 hover:text-primary hover:bg-primary-muted/40"
                )}
              >
                {link.label}
              </Link>
            )
          })}
          {roleLinks.length > 0 && (
            <div className="h-4 w-px bg-border mx-1" aria-hidden />
          )}
          {roleLinks.map((link) => {
            const active = isActive(pathname, link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative py-2 px-3 rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                  active
                    ? "text-primary bg-primary-muted/60"
                    : "text-muted-foreground hover:text-primary hover:bg-primary-muted/40"
                )}
              >
                {link.label}
              </Link>
            )
          })}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className="flex items-center gap-2 h-10 px-2 rounded-lg hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatarUrl ?? undefined} />
                  <AvatarFallback className="bg-primary-muted text-primary text-sm">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="font-medium text-sm">
                    {user.name ?? user.email}
                  </p>
                  <Badge
                    variant={roleBadgeVariants[user.role]}
                    className="text-xs mt-1"
                  >
                    {roleLabels[user.role]}
                  </Badge>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logg ut
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants(),
                "bg-primary hover:bg-primary/90 text-primary-foreground btn-lift"
              )}
            >
              Logg inn
            </Link>
          )}
        </div>

        {/* Mobile */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger className="md:hidden h-11 w-11 min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Åpne meny</span>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-full sm:max-w-md bg-card/95 backdrop-blur-md p-0"
            showCloseButton={false}
          >
            <SheetTitle className="sr-only">Navigasjonsmeny</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-lg">Meny</span>
                <SheetClose className="h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors">
                  <X className="h-6 w-6" />
                  <span className="sr-only">Lukk meny</span>
                </SheetClose>
              </div>

              {user && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatarUrl ?? undefined} />
                      <AvatarFallback className="bg-primary-muted text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {user.name ?? user.email}
                      </p>
                      <Badge
                        variant={roleBadgeVariants[user.role]}
                        className="text-xs"
                      >
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex-1 py-6">
                <div className="flex flex-col gap-1 px-4">
                  {navLinks.map((link) => {
                    const active = isActive(pathname, link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center min-h-[44px] h-12 px-4 text-lg font-medium rounded-lg transition-colors",
                          active
                            ? "bg-primary-muted text-primary"
                            : "text-foreground hover:bg-primary-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                  {roleLinks.length > 0 && (
                    <div className="h-px bg-border my-2 mx-2" aria-hidden />
                  )}
                  {roleLinks.map((link) => {
                    const active = isActive(pathname, link.href)
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center min-h-[44px] h-12 px-4 text-lg font-medium rounded-lg transition-colors",
                          active
                            ? "bg-primary-muted text-primary"
                            : "text-foreground hover:bg-primary-muted"
                        )}
                      >
                        {link.label}
                      </Link>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 border-t">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => {
                      setIsOpen(false)
                      handleSignOut()
                    }}
                  >
                    <LogOut className="h-5 w-5 mr-2" />
                    Logg ut
                  </Button>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      buttonVariants(),
                      "w-full h-12 bg-primary hover:bg-primary/90 text-white btn-lift"
                    )}
                  >
                    Logg inn
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
