import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { JWT_SECRET, SESSION_COOKIE } from "@/lib/session-config";

const PUBLIC_PATHS = new Set([
  "/",
  "/courses",
  "/books",
  "/success-story",
  "/contact",
  "/login",
]);

function isPublicPath(pathname: string) {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/courses/")) return true;
  if (pathname.startsWith("/books/")) return true;
  if (pathname.startsWith("/api/auth/login")) return true;
  if (pathname.startsWith("/api/books/")) return true;
  if (pathname.startsWith("/api/success-stories/")) return true;
  if (pathname.startsWith("/api/courses/") && pathname.endsWith("/cover")) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  const isPublic = isPublicPath(pathname);

  if (isPublic) {
    if (pathname === "/login" && token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = payload.role as string;
        return NextResponse.redirect(
          new URL(role === "ADMIN" ? "/admin" : "/student/materials", request.url)
        );
      } catch {
        // invalid token, allow login
      }
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/student/materials", request.url));
    }

    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\..*).*)"],
};
