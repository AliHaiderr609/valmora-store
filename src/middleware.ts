import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

function isWordPressProbe(pathname: string) {
  return (
    pathname === "/wp-json" ||
    pathname.startsWith("/wp-json/") ||
    pathname === "/xmlrpc.php" ||
    pathname === "/wp-login.php" ||
    pathname.startsWith("/wp-admin")
  );
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // This is not a WordPress site — return a clean 404 for common WP probes.
  if (isWordPressProbe(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const isAdmin = pathname.startsWith("/admin");
  const isAccount = pathname.startsWith("/account");
  const isAdminApi = pathname.startsWith("/api/admin");

  if (!isAdmin && !isAccount && !isAdminApi) return NextResponse.next();

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  });

  if (!token) {
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    const signInUrl = new URL("/login", req.url);
    signInUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(signInUrl);
  }

  if ((isAdmin || isAdminApi) && token.role !== "ADMIN" && token.role !== "STAFF") {
    if (isAdminApi) {
      return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/:path*",
    "/api/admin/:path*",
    "/wp-json",
    "/wp-json/:path*",
    "/xmlrpc.php",
    "/wp-login.php",
    "/wp-admin/:path*",
  ],
};
