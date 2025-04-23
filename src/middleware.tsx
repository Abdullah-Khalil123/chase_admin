// middleware.ts (place in the root directory)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define paths that should be public
const publicPaths = ["/login", "/api/auth/login", "/forgot-password"];

const isPublicPath = (path: string) => {
  return publicPaths.some(
    (publicPath) =>
      path === publicPath ||
      path.startsWith(`${publicPath}/`) ||
      path.startsWith(`${publicPath}?`)
  );
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const userDataCookie = request.cookies.get("userData")?.value;

  if (!token || !userDataCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAdminRoute = [
    "/users/add",
    "/users/manage",
    "/transactions/add",
  ].some((adminPath) => pathname.startsWith(adminPath));

  if (isAdminRoute) {
    try {
      const userData = JSON.parse(userDataCookie);
      if (!userData.role) {
        return NextResponse.redirect(
          new URL("/login?error=unauthorized", request.url)
        );
      }
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login|api/auth/login|forgot-password).*)",
  ],
};
