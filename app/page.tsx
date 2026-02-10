import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Shield, Users, Globe } from "lucide-react";
import {
  HeroIllustration,
  HowItWorksPostIllustration,
  HowItWorksMatchIllustration,
  HowItWorksTrustIllustration,
} from "@/components/illustrations";

export const metadata: Metadata = {
  title: "CivicForge — Your community, connected",
  description:
    "A community needs board where people post needs, offer help, get AI-matched, and build reputation. No ads, no data selling — just neighbors helping neighbors.",
  openGraph: {
    title: "CivicForge — Your community, connected",
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

      <HeroIllustration className="h-48 w-auto mb-8 sm:h-56" />

      <h1 className="max-w-3xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
        Your community, connected.
      </h1>

      <p className="mt-6 max-w-xl text-lg text-muted-foreground sm:text-xl">
        A single spark can spread warmth.
      </p>

      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/login"
          className="inline-flex h-12 items-center justify-center rounded-full bg-golden-hour px-8 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-golden-hour/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-hour"
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
      icon: <HowItWorksPostIllustration className="h-8 w-8" />,
      title: "Post a need or offer",
      description:
        "Tell your neighbors what you need help with, or share what you can offer. It takes less than a minute.",
    },
    {
      icon: <HowItWorksMatchIllustration className="h-8 w-8" />,
      title: "Get matched with neighbors",
      description:
        "Our AI compass finds the right connections in your community. You always review and approve before anything is shared.",
    },
    {
      icon: <HowItWorksTrustIllustration className="h-8 w-8" />,
      title: "Help each other, build trust",
      description:
        "Every act of help strengthens the community. Build a reputation that reflects who you are in your community.",
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
          {steps.map((step) => (
            <div
              key={step.title}
              className="card-hover rounded-xl border border-border bg-card p-8 text-center"
            >
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
      icon: <Lock className="h-6 w-6" aria-hidden="true" />,
      title: "No ads, ever",
      description:
        "Your attention belongs to your community, not advertisers. CivicForge will never show ads.",
    },
    {
      icon: <Shield className="h-6 w-6" aria-hidden="true" />,
      title: "Your data stays yours",
      description:
        "We never sell your personal information. AI processes structured data only -- your words are never stored raw.",
    },
    {
      icon: <Users className="h-6 w-6" aria-hidden="true" />,
      title: "Community-owned",
      description:
        "Built to serve communities, not shareholders. The platform grows with the community it supports.",
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

function CommonsSection() {
  return (
    <section className="border-t border-border px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-offer-light text-offer">
          <Globe className="h-7 w-7" aria-hidden="true" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          See The Commons
        </h2>
        <p className="mt-4 text-lg text-muted-foreground">
          Explore the living relationships between skill domains, guilds, and
          civic coordination — all in the open, privacy-respecting, and free.
        </p>
        <Link
          href="/commons"
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-golden-hour px-10 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-golden-hour/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-hour"
        >
          Explore The Commons
        </Link>
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
          className="mt-8 inline-flex h-12 items-center justify-center rounded-full bg-golden-hour px-10 text-base font-medium text-accent-foreground shadow-sm transition-colors hover:bg-golden-hour/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-golden-hour"
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
        <CommonsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
