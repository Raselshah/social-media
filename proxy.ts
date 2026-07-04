import { getCurrentUserFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthRoute =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const isProtectedRoute = pathname.startsWith("/feed");

  const user = await getCurrentUserFromRequest(request);

  if (isProtectedRoute && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/feed", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/feed"],
};
