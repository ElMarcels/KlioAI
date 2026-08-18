import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAuthPage =
    nextUrl.pathname.startsWith("/login") ||
    nextUrl.pathname.startsWith("/register") ||
    nextUrl.pathname.startsWith("/forgot-password") ||
    nextUrl.pathname.startsWith("/reset-password");

  const isProtectedPage =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/chat") ||
    nextUrl.pathname.startsWith("/models") ||
    nextUrl.pathname.startsWith("/settings") ||
    nextUrl.pathname.startsWith("/billing") ||
    nextUrl.pathname.startsWith("/support") ||
    nextUrl.pathname.startsWith("/profile");

  const isAdminPage = nextUrl.pathname.startsWith("/admin");

  // Redirect logged-in users away from auth pages
  if (isAuthPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to login
  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", nextUrl);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protect admin routes
  if (isAdminPage) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
