import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CivicForge collects, uses, and protects your personal information. No ads, no data selling.",
  openGraph: {
    title: "Privacy Policy | CivicForge",
    description:
      "How CivicForge collects, uses, and protects your personal information.",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <article className="prose-civic">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Privacy Policy
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: February 7, 2026
      </p>
      <p className="mt-6 text-lg text-muted-foreground">
        CivicForge is operated by Wicks LLC. We believe your data belongs to
        you. This policy explains what we collect, why, and how you stay in
        control.
      </p>

      {/* 1. What Data We Collect */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">1. What data we collect</h2>
        <p className="mt-4 text-muted-foreground">
          We collect only what is needed to connect you with your neighbors.
        </p>

        <h3 className="mt-6 text-lg font-semibold">Required information</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Email address</strong> -- used
            for authentication and account recovery
          </li>
          <li>
            <strong className="text-foreground">Display name</strong> -- the
            name your neighbors will see
          </li>
          <li>
            <strong className="text-foreground">Community</strong> -- used to
            scope your board to your local community
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">Optional information</h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Phone number</strong> -- for
            account verification and optional SMS notifications
          </li>
          <li>
            <strong className="text-foreground">Skills and interests</strong>{" "}
            -- to help match you with relevant needs and offers
          </li>
          <li>
            <strong className="text-foreground">Bio</strong> -- a short
            description visible to your neighbors
          </li>
          <li>
            <strong className="text-foreground">Photos</strong> -- profile photo
            and post images to help your neighbors recognize you and your
            requests
          </li>
        </ul>

        <h3 className="mt-6 text-lg font-semibold">
          Automatically collected data
        </h3>
        <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            Basic usage analytics (page views, feature usage) -- no
            fingerprinting, no cross-site tracking
          </li>
          <li>
            Device type and browser for compatibility -- never used for
            advertising
          </li>
        </ul>
      </section>

      {/* 2. How We Use Your Data */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">2. How we use your data</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Matching</strong> -- connecting
            your needs and offers with relevant neighbors in your community
          </li>
          <li>
            <strong className="text-foreground">Community features</strong> --
            displaying your posts, profile, and reputation within your
            community board
          </li>
          <li>
            <strong className="text-foreground">Notifications</strong> --
            alerting you to relevant matches, messages, and community activity
            (configurable)
          </li>
          <li>
            <strong className="text-foreground">Platform improvement</strong>{" "}
            -- understanding aggregate usage patterns to make the platform
            better for everyone
          </li>
        </ul>
        <p className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          We never sell your data. We never use your data for advertising. We
          never share your personal information with data brokers.
        </p>
      </section>

      {/* 3. AI Processing Disclosure */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">3. AI processing disclosure</h2>
        <p className="mt-4 text-muted-foreground">
          CivicForge uses artificial intelligence to help match needs with
          offers and to assist with post creation. Here is exactly how that
          works:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">AI provider</strong> -- We use
            Anthropic&apos;s Claude for AI processing
          </li>
          <li>
            <strong className="text-foreground">Structured data only</strong>{" "}
            -- The AI processes structured metadata (categories, skills,
            availability, location) to generate matches. Your raw text is not
            stored or used in the matching pipeline
          </li>
          <li>
            <strong className="text-foreground">Post assistance</strong> -- When
            you use the AI writing assistant, your draft text is sent to
            Anthropic for processing. Anthropic does not use this data to train
            their models (per our data processing agreement)
          </li>
          <li>
            <strong className="text-foreground">Human review</strong> -- You
            always review and approve AI-generated content before it is posted
            or shared
          </li>
          <li>
            <strong className="text-foreground">No profiling</strong> -- AI is
            never used to build behavioral profiles or predict personal
            attributes beyond what you explicitly share
          </li>
        </ul>
      </section>

      {/* 4. Third-Party Processors */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">4. Third-party processors</h2>
        <p className="mt-4 text-muted-foreground">
          We share data with the following service providers, solely to operate
          CivicForge:
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">Supabase</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Authentication, database storage, and file storage. Your data is
              encrypted at rest and in transit. Hosted in the United States.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">Anthropic</p>
            <p className="mt-1 text-sm text-muted-foreground">
              AI processing for matching and post assistance. Data is processed
              under a data processing agreement that prohibits use for model
              training. Hosted in the United States.
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="font-semibold">Vercel</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Web application hosting and edge delivery. Processes request
              metadata (IP address, user agent) for serving the application.
              Hosted globally with primary infrastructure in the United States.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Data Retention */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">5. Data retention</h2>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Active accounts</strong> -- Your
            data is retained for as long as your account is active
          </li>
          <li>
            <strong className="text-foreground">Account deletion</strong> --
            When you request deletion, we begin a 30-day deletion pipeline.
            During this period, your account is immediately deactivated (hidden
            from neighbors) and your data is queued for permanent removal
          </li>
          <li>
            <strong className="text-foreground">Cancellation window</strong> --
            You may cancel a deletion request within the 30-day window by
            contacting us
          </li>
          <li>
            <strong className="text-foreground">Post content</strong> -- When
            your account is deleted, your posts are anonymized (author
            attribution removed) rather than deleted, to preserve community
            context. You may request full post deletion separately
          </li>
          <li>
            <strong className="text-foreground">Backups</strong> -- Encrypted
            backups may retain data for up to 90 days after deletion before
            being purged
          </li>
        </ul>
      </section>

      {/* 6. Your Rights */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">6. Your rights</h2>
        <p className="mt-4 text-muted-foreground">
          You have the following rights regarding your personal data:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Access</strong> -- View all
            personal data we hold about you, available through your account
            settings
          </li>
          <li>
            <strong className="text-foreground">Export</strong> -- Download a
            machine-readable copy of your data at any time from your account
            settings
          </li>
          <li>
            <strong className="text-foreground">Deletion</strong> -- Request
            complete deletion of your account and personal data
          </li>
          <li>
            <strong className="text-foreground">Correction</strong> -- Update or
            correct any personal information through your profile
          </li>
          <li>
            <strong className="text-foreground">Consent management</strong> --
            Adjust your privacy preferences, notification settings, and data
            sharing choices at any time
          </li>
          <li>
            <strong className="text-foreground">Withdraw consent</strong> -- You
            may withdraw consent for optional data processing at any time
            without affecting the core service
          </li>
        </ul>
      </section>

      {/* 7. Global Privacy Control */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">7. Global Privacy Control</h2>
        <p className="mt-4 text-muted-foreground">
          We honor the{" "}
          <a
            href="https://globalprivacycontrol.org"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Global Privacy Control (GPC)
          </a>{" "}
          signal. If your browser sends a GPC signal, we treat it as a valid
          opt-out of any non-essential data processing. Since CivicForge does
          not sell data or serve targeted advertising, the GPC signal primarily
          affects optional analytics.
        </p>
      </section>

      {/* 8. Age Requirement */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">8. Age requirement</h2>
        <p className="mt-4 text-muted-foreground">
          CivicForge is intended for users who are 18 years of age or older. We
          do not knowingly collect personal information from anyone under 18. If
          we learn that we have collected data from a person under 18, we will
          delete that information promptly.
        </p>
      </section>

      {/* 9. Changes to This Policy */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">9. Changes to this policy</h2>
        <p className="mt-4 text-muted-foreground">
          We may update this privacy policy from time to time. When we make
          material changes, we will notify you via email and/or a prominent
          notice on the platform at least 30 days before the changes take
          effect. Your continued use of CivicForge after the effective date
          constitutes acceptance of the updated policy.
        </p>
      </section>

      {/* 10. Contact */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">10. Contact us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have questions about this privacy policy or your personal data,
          contact us at:
        </p>
        <p className="mt-4">
          <a
            href="mailto:privacy@civicforge.org"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            privacy@civicforge.org
          </a>
        </p>
        <p className="mt-6 text-sm text-muted-foreground">
          Wicks LLC
          <br />
          Operating CivicForge
        </p>
      </section>
    </article>
  );
}
