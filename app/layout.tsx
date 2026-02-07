import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CivicForge — Your neighborhood, connected",
    template: "%s | CivicForge",
  },
  description:
    "A neighborhood needs board where people post needs, offer help, get AI-matched, and build reputation. No ads, no data selling — just neighbors helping neighbors.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://civicforge.org"
  ),
  openGraph: {
    title: "CivicForge — Your neighborhood, connected",
    description:
      "Post a need, offer help, get matched with neighbors. Community-owned, privacy-first.",
    siteName: "CivicForge",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
