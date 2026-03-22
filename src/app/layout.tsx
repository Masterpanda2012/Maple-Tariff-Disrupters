import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { AuthSessionProvider } from "~/app/_components/session-provider";
import { Footer } from "~/components/layout/Footer";
import { Navbar } from "~/components/layout/Navbar";

export const metadata: Metadata = {
  title: "Maple Tariff Disruptors",
  description:
    "A Canadian platform for businesses to navigate economic swings and for people who want to support Canadian businesses find and buy Canadian products.",
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
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
