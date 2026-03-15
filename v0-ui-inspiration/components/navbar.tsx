"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, User, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetTitle } from "@/components/ui/sheet"

// Mock user state - in real app this would come from auth context
const mockUser = {
  isLoggedIn: true,
  name: "Ola Nordmann",
  email: "ola.nordmann@gmail.com",
  role: "admin" as "user" | "instructor" | "admin",
  avatar: null,
}

const roleLabels = {
  user: "Bruker",
  instructor: "Instruktør",
  admin: "Admin",
}

const roleBadgeStyles = {
  user: "bg-muted text-muted-foreground",
  instructor: "bg-sky-100 text-sky-800",
  admin: "bg-amber-100 text-amber-800",
}

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const user = mockUser

  const navLinks = [
    { href: "/", label: "Hjem" },
    { href: "/spots", label: "Spot guide" },
    { href: "/courses", label: "Kurs" },
  ]

  const roleLinks = []
  if (user.isLoggedIn && (user.role === "instructor" || user.role === "admin")) {
    roleLinks.push({ href: "/instructor", label: "Instruktør" })
  }
  if (user.isLoggedIn && user.role === "admin") {
    roleLinks.push({ href: "/admin", label: "Admin" })
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-white/20">
      <nav className="mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="font-semibold text-lg text-foreground hover:text-sky-600 transition-colors">
          Ålesund Kiteklubb
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-sky-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {roleLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-foreground/80 hover:text-sky-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}

          {/* Auth */}
          {user.isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 h-10 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-sky-100 text-sky-800 text-sm">
                      {user.name.split(" ").map(n => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-2">
                  <p className="font-medium text-sm">{user.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={`text-xs ${roleBadgeStyles[user.role]}`}>
                      {roleLabels[user.role]}
                    </Badge>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/login" className="flex items-center gap-2 cursor-pointer">
                    <LogOut className="h-4 w-4" />
                    Logg ut
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default" className="bg-sky-600 hover:bg-sky-700">
              <Link href="/login">Logg inn</Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Åpne meny</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md bg-white/95 backdrop-blur-md p-0">
            <SheetTitle className="sr-only">Navigasjonsmeny</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b">
                <span className="font-semibold text-lg">Meny</span>
                <SheetClose asChild>
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <X className="h-6 w-6" />
                    <span className="sr-only">Lukk meny</span>
                  </Button>
                </SheetClose>
              </div>

              {/* User info for mobile */}
              {user.isLoggedIn && (
                <div className="p-4 border-b bg-muted/30">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar || undefined} />
                      <AvatarFallback className="bg-sky-100 text-sky-800">
                        {user.name.split(" ").map(n => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <Badge className={`text-xs ${roleBadgeStyles[user.role]}`}>
                        {roleLabels[user.role]}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile nav links */}
              <div className="flex-1 py-6">
                <div className="flex flex-col gap-2 px-4">
                  {navLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center h-12 px-4 text-lg font-medium text-foreground hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  {roleLinks.map((link) => (
                    <SheetClose key={link.href} asChild>
                      <Link
                        href={link.href}
                        className="flex items-center h-12 px-4 text-lg font-medium text-foreground hover:bg-sky-50 rounded-lg transition-colors"
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </div>
              </div>

              {/* Mobile auth */}
              <div className="p-4 border-t">
                {user.isLoggedIn ? (
                  <SheetClose asChild>
                    <Button variant="outline" className="w-full h-12" asChild>
                      <Link href="/login" className="flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        Logg ut
                      </Link>
                    </Button>
                  </SheetClose>
                ) : (
                  <SheetClose asChild>
                    <Button className="w-full h-12 bg-sky-600 hover:bg-sky-700" asChild>
                      <Link href="/login">Logg inn</Link>
                    </Button>
                  </SheetClose>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
