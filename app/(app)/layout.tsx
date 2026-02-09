import { Nav } from "@/components/nav";
import { AdvocateChat } from "@/components/advocate-chat";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="mx-auto max-w-5xl px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <AdvocateChat />
    </div>
  );
}
