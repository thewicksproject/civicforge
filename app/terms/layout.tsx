import Link from "next/link";

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline underline-offset-4 transition-colors hover:text-foreground"
          >
            &larr; Back to CivicForge
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12 sm:py-16">
        {children}
      </main>
      <footer className="border-t border-border px-6 py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-sm text-muted-foreground sm:flex-row sm:justify-between">
          <p>
            A{" "}
            <a
              href="https://thewicksproject.org"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wicks LLC
            </a>{" "}
            project
          </p>
          <nav className="flex gap-6">
            <Link
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 transition-colors hover:text-foreground"
            >
              Terms
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
