import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge-safe middleware only: no `next-auth/jwt` or `~/lib/auth` (those pull Node-only
 * APIs and Prisma into the Edge bundle and fail the build).
 *
 * Auth and role checks run in `app/business/layout.tsx` and `app/marketplace/layout.tsx`
 * via `auth()` (Node). We pass the requested path so layouts can set `callbackUrl`.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-invoke-path",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/business/:path*", "/marketplace/:path*"],
};
