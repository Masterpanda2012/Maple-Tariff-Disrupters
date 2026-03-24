import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const ROLE_BUSINESS = "BUSINESS";
const ROLE_CUSTOMER = "CUSTOMER";

export default async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const pathname = req.nextUrl.pathname;
  const role =
    token.role === ROLE_BUSINESS || token.role === ROLE_CUSTOMER
      ? token.role
      : ROLE_CUSTOMER;

  if (pathname.startsWith("/business") && role === ROLE_CUSTOMER) {
    return NextResponse.redirect(new URL("/marketplace", req.nextUrl.origin));
  }

  if (pathname.startsWith("/marketplace") && role === ROLE_BUSINESS) {
    return NextResponse.redirect(
      new URL("/business/dashboard", req.nextUrl.origin),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/business/:path*", "/marketplace/:path*"],
};
