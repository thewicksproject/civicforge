import type { Metadata } from "next";
import { headers } from "next/headers";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CivicForge — Your community, connected",
    template: "%s | CivicForge",
  },
  description:
    "A community needs board where people post needs, offer help, get AI-matched, and build reputation. No ads, no data selling — just neighbors helping neighbors.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://civicforge.org"
  ),
  openGraph: {
    title: "CivicForge — Your community, connected",
    description:
      "Post a need, offer help, get matched with neighbors. Community-owned, privacy-first.",
    siteName: "CivicForge",
    type: "website",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") ?? "";

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider nonce={nonce}>{children}</ThemeProvider>
      </body>
    </html>
  );
}
