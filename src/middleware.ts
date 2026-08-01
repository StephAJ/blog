import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "sa_session";

/**
 * The OpenLiteSpeed reverse proxy in front of this app duplicates the Origin
 * header on every hop ("https://x, https://x"). Next's Server Action CSRF
 * check does `new URL(origin)` on the raw header and throws on that shape, so
 * every admin form 500s. De-dupe it before anything downstream reads it.
 */
function dedupedOriginHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  const origin = headers.get("origin");
  if (origin?.includes(",")) {
    headers.set("origin", origin.split(",")[0]!.trim());
  }
  return headers;
}

/**
 * Gate for /admin. Runs on the edge runtime, so it only verifies the JWT —
 * database-backed checks happen in the admin layout.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const headers = dedupedOriginHeaders(request);

  if (pathname === "/admin/login") {
    return NextResponse.next({ request: { headers } });
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;

  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ["HS256"],
      });
      return NextResponse.next({ request: { headers } });
    } catch {
      // Expired or tampered — fall through to the redirect.
    }
  }

  const login = new URL("/admin/login", request.url);
  if (pathname !== "/admin") login.searchParams.set("next", pathname);

  const response = NextResponse.redirect(login);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};
