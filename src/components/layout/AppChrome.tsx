"use client";

import { usePathname } from "next/navigation";

import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";

const MINIMAL_ROUTES = new Set(["/login", "/register"]);

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const minimal = pathname ? MINIMAL_ROUTES.has(pathname) : false;

  if (minimal) {
    return children;
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:inline-block focus:overflow-visible focus:rounded-lg focus:bg-maple focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:shadow-lg"
      >
        Skip to main content
      </a>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
