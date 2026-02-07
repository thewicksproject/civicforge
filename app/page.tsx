import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CivicForge — Your neighborhood, connected",
  description:
    "A neighborhood needs board where people post needs, offer help, get AI-matched, and build reputation. No ads, no data selling — just neighbors helping neighbors.",
  openGraph: {
    title: "CivicForge — Your neighborhood, connected",
    description:
      "Post a need, offer help, get matched with neighbors. Community-owned, privacy-first.",
  },
};

function HeroSection() {
  return (
    <section className="relative flex min-h-[85vh] flex-col items-center justify-center px-6 py-24 text-center">
      {/* Subtle background warmth */}
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 50% 40%, var(--meadow-light) 0%, transparent 70%)",
          opacity: 0.4,
        }}
      />

      <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
        Your neighborhood, connected.
      </h1>

      <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
        A single spark can spread warmth.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-8 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Get Started
        </Link>
        <a
          href="#how-it-works"
          className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-8 text-base font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Learn More
        </a>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M12 20h9" />
          <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.855z" />
        </svg>
      ),
      title: "Post a need or offer",
      description:
        "Tell your neighbors what you need help with, or share what you can offer. It takes less than a minute.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      title: "Get matched with neighbors",
      description:
        "Our AI compass finds the right connections in your community. You always review and approve before anything is shared.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-8 w-8"
          aria-hidden="true"
        >
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      ),
      title: "Help each other, build trust",
      description:
        "Every act of help strengthens the neighborhood. Build a reputation that reflects who you are in your community.",
    },
  ];

  return (
    <section
      id="how-it-works"
      className="scroll-mt-16 px-6 py-24"
    >
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          How it works
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Three simple steps to start making a difference on your block.
        </p>

        <div className="mt-16 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div
              key={step.title}
              className="card-hover relative rounded-xl border border-border bg-card p-8 text-center"
            >
              {/* Step number */}
              <span className="absolute top-4 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-offer-light text-offer">
                {step.icon}
              </div>
              <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
              <p className="mt-3 text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ValuesSection() {
  const values = [
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      title: "No ads, ever",
      description:
        "Your attention belongs to your community, not advertisers. CivicForge will never show ads.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      ),
      title: "Your data stays yours",
      description:
        "We never sell your personal information. AI processes structured data only -- your words are never stored raw.",
    },
    {
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          aria-hidden="true"
        >
          <path d="M18 21a8 8 0 0 0-16 0" />
          <circle cx="10" cy="8" r="5" />
          <path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" />
        </svg>
      ),
      title: "Community-owned",
      description:
        "Built to serve neighborhoods, not shareholders. The platform grows with the community it supports.",
    },
  ];

  return (
    <section className="border-t border-border bg-card px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl">
          Built on trust
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Technology should serve the community, not the other way around.
        </p>

        <div className="mt-16 grid gap-10 sm:grid-cols-3">
          {values.map((value) => (
            <div key={value.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-background text-primary">
                {value.icon}
              </div>
              <h3 className="mt-5 text-lg font-semibold">{value.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to connect?
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Join neighbors who are already helping each other. It only takes a
          moment to get started.
        </p>
        <Link
          href="/login"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-primary px-10 text-base font-medium text-primary-foreground shadow-sm transition-colors hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          Sign Up Free
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border px-6 py-12">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <p className="text-sm text-muted-foreground">
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

        <nav className="flex gap-6 text-sm text-muted-foreground">
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
          <a
            href="https://thewicksproject.org"
            className="underline underline-offset-4 transition-colors hover:text-foreground"
            target="_blank"
            rel="noopener noreferrer"
          >
            thewicksproject.org
          </a>
        </nav>
      </div>
    </footer>
  );
}

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <main className="flex-1">
        <HeroSection />
        <HowItWorksSection />
        <ValuesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
