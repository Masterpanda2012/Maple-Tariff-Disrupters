import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { AuthSessionProvider } from "~/app/_components/session-provider";
import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Maple Tariff Disruptors",
  description:
    "Trade-aware intelligence and a product marketplace for businesses and shoppers worldwide — clear economic briefings, supplier context, and local commerce.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <AuthSessionProvider>
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
        </AuthSessionProvider>
      </body>
    </html>
  );
}
