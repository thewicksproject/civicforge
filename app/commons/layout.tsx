import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Commons — CivicForge",
  description:
    "A public, privacy-respecting community visualization dashboard showing the living relationships between skill domains, guilds, and civic coordination.",
};

export const revalidate = 300; // ISR: regenerate every 5 minutes

export default function CommonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {children}
    </div>
  );
}
