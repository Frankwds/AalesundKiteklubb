import { NextResponse, type NextRequest } from "next/server"
import { updateSession } from "@/lib/supabase/middleware"
import { decodeJwtPayload } from "@/lib/auth/decode-jwt"

export async function proxy(request: NextRequest) {
  const { supabaseResponse, supabase } = await updateSession(request)

  const pathname = request.nextUrl.pathname

  // Role-based route protection
  const isAdminRoute = pathname.startsWith("/admin")
  const isInstructorRoute = pathname.startsWith("/instructor")
  const isChatRoute = /^\/courses\/[^/]+\/chat/.test(pathname)

  if (isAdminRoute || isInstructorRoute || isChatRoute) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirect = NextResponse.redirect(
        new URL("/login", request.url)
      )
      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) =>
          redirect.cookies.set(cookie.name, cookie.value)
        )
      return redirect
    }

    const jwt = decodeJwtPayload(session.access_token)
    const role = (jwt.user_role as string) ?? "user"

    if (isAdminRoute && role !== "admin") {
      const redirect = NextResponse.redirect(new URL("/", request.url))
      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) =>
          redirect.cookies.set(cookie.name, cookie.value)
        )
      return redirect
    }

    if (
      isInstructorRoute &&
      role !== "instructor" &&
      role !== "admin"
    ) {
      const redirect = NextResponse.redirect(new URL("/", request.url))
      supabaseResponse.cookies
        .getAll()
        .forEach((cookie) =>
          redirect.cookies.set(cookie.name, cookie.value)
        )
      return redirect
    }

    // Chat routes only require authentication (enrollment checked at page level)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
