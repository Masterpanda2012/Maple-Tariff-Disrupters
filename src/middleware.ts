import { NextResponse } from "next/server";

import { UserRole } from "../generated/prisma";
import { auth } from "~/server/auth";

export default auth((req) => {
  const session = req.auth;
  if (!session?.user) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set(
      "callbackUrl",
      `${req.nextUrl.pathname}${req.nextUrl.search}`,
    );
    return NextResponse.redirect(loginUrl);
  }

  const pathname = req.nextUrl.pathname;
  const role = session.user.role ?? UserRole.CUSTOMER;

  if (pathname.startsWith("/business") && role === UserRole.CUSTOMER) {
    return NextResponse.redirect(new URL("/marketplace", req.nextUrl.origin));
  }

  if (pathname.startsWith("/marketplace") && role === UserRole.BUSINESS) {
    return NextResponse.redirect(
      new URL("/business/dashboard", req.nextUrl.origin),
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/business/:path*", "/marketplace/:path*"],
};
