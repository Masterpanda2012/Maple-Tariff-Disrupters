import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "~/lib/auth";

const ROLE_BUSINESS = "BUSINESS";
const ROLE_CUSTOMER = "CUSTOMER";

export default async function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const h = await headers();
  const invokePath = h.get("x-invoke-path") ?? "/business/dashboard";

  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(invokePath)}`);
  }

  const role =
    session.user.role === ROLE_BUSINESS || session.user.role === ROLE_CUSTOMER
      ? session.user.role
      : ROLE_CUSTOMER;

  if (role !== ROLE_BUSINESS) {
    redirect("/marketplace");
  }

  return children;
}
