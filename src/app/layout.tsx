import "~/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

import { AuthSessionProvider } from "~/app/_components/session-provider";
import { AppChrome } from "~/components/layout/AppChrome";

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
          <AppChrome>{children}</AppChrome>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
