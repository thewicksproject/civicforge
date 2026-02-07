import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for CivicForge, a community platform by Wicks LLC. Read before using the platform.",
  openGraph: {
    title: "Terms of Service | CivicForge",
    description:
      "Terms of Service for CivicForge, a community platform by Wicks LLC.",
  },
};

export default function TermsOfServicePage() {
  return (
    <article className="prose-civic">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Terms of Service
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Effective date: February 7, 2026
      </p>
      <p className="mt-6 text-lg text-muted-foreground">
        CivicForge is operated by Wicks LLC. These terms govern your use of the
        CivicForge platform and services.
      </p>

      {/* 1. Acceptance of Terms */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">1. Acceptance of terms</h2>
        <p className="mt-4 text-muted-foreground">
          By creating an account or using CivicForge, you agree to be bound by
          these Terms of Service, our{" "}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          , and any additional guidelines posted on the platform. If you do not
          agree to these terms, you may not use CivicForge.
        </p>
      </section>

      {/* 2. Account Requirements */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">2. Account requirements</h2>
        <p className="mt-4 text-muted-foreground">
          To use CivicForge, you must:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Be at least 18 years old</strong>{" "}
            -- CivicForge is designed for adult community members
          </li>
          <li>
            <strong className="text-foreground">
              Provide accurate information
            </strong>{" "}
            -- Your display name, neighborhood, and contact information must be
            truthful. You do not need to use your legal name, but you may not
            impersonate another person
          </li>
          <li>
            <strong className="text-foreground">
              Complete phone verification
            </strong>{" "}
            -- To maintain trust and reduce abuse, we require phone number
            verification during signup. Each phone number may only be associated
            with one account
          </li>
          <li>
            <strong className="text-foreground">
              Keep your account secure
            </strong>{" "}
            -- You are responsible for maintaining the security of your account
            credentials. Notify us immediately if you suspect unauthorized
            access
          </li>
        </ul>
      </section>

      {/* 3. Acceptable Use */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">3. Acceptable use</h2>
        <p className="mt-4 text-muted-foreground">
          CivicForge is a community platform built on trust. You agree not to:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Spam or solicit</strong> -- Post
            unsolicited commercial content, advertisements, or bulk messages.
            CivicForge is for genuine community needs and offers, not commercial
            promotion
          </li>
          <li>
            <strong className="text-foreground">Harass or threaten</strong> --
            Engage in harassment, bullying, intimidation, hate speech, or
            threats of violence against any person or group
          </li>
          <li>
            <strong className="text-foreground">
              Post illegal content
            </strong>{" "}
            -- Share content that violates any applicable law, including but not
            limited to content that promotes illegal activity, violates
            intellectual property rights, or constitutes fraud
          </li>
          <li>
            <strong className="text-foreground">
              Engage in commercial solicitation
            </strong>{" "}
            -- Use the platform to sell products or services, recruit for
            businesses, or conduct commercial transactions. Genuine offers of
            help (including skilled help) are welcome; commercial advertising is
            not
          </li>
          <li>
            <strong className="text-foreground">Manipulate the platform</strong>{" "}
            -- Create multiple accounts, manipulate reputation scores, abuse the
            matching system, or interfere with other users&apos; experience
          </li>
          <li>
            <strong className="text-foreground">Misrepresent yourself</strong>{" "}
            -- Claim qualifications, certifications, or affiliations you do not
            hold, particularly for offers involving professional skills
          </li>
        </ul>
      </section>

      {/* 4. User Content */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">4. User content</h2>
        <p className="mt-4 text-muted-foreground">
          When you post content on CivicForge (including needs, offers, photos,
          and profile information):
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">You own your content</strong> --
            You retain all ownership rights to content you create and post on
            CivicForge
          </li>
          <li>
            <strong className="text-foreground">You grant us a license</strong>{" "}
            -- By posting content, you grant Wicks LLC a non-exclusive,
            royalty-free, worldwide license to display, distribute, and
            reproduce your content solely for the purpose of operating and
            improving CivicForge. This license ends when you delete your content
            or account (subject to our data retention policy)
          </li>
          <li>
            <strong className="text-foreground">We can moderate</strong> -- We
            reserve the right to review, edit, or remove content that violates
            these terms, our community guidelines, or applicable law. We may
            also use community-based moderation as described in the trust tiers
            section below
          </li>
          <li>
            <strong className="text-foreground">
              You are responsible for your content
            </strong>{" "}
            -- You represent that you have the right to post any content you
            share, and that your content does not infringe on any third
            party&apos;s rights
          </li>
        </ul>
      </section>

      {/* 5. AI Features */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">5. AI features</h2>
        <p className="mt-4 text-muted-foreground">
          CivicForge uses artificial intelligence to enhance your experience.
          You understand and agree that:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">AI is an assistant</strong> --
            AI features (including matching suggestions and writing assistance)
            are tools to help you, not replacements for your judgment. AI
            suggestions may be inaccurate or inappropriate
          </li>
          <li>
            <strong className="text-foreground">
              You review before posting
            </strong>{" "}
            -- Any AI-assisted content is presented to you for review before
            being posted or shared. You are responsible for all content posted
            under your account, whether AI-assisted or not
          </li>
          <li>
            <strong className="text-foreground">No guarantees</strong> -- We do
            not guarantee the accuracy, completeness, or appropriateness of any
            AI-generated content or matching suggestions. Matches are
            suggestions, not endorsements
          </li>
          <li>
            <strong className="text-foreground">
              AI does not replace professional advice
            </strong>{" "}
            -- AI features are not a substitute for professional, legal,
            medical, or financial advice. Use your own judgment when responding
            to needs or offers
          </li>
        </ul>
      </section>

      {/* 6. Trust Tiers and Community Moderation */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">
          6. Trust tiers and community moderation
        </h2>
        <p className="mt-4 text-muted-foreground">
          CivicForge uses a trust tier system to foster safe communities:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>
            <strong className="text-foreground">Reputation is earned</strong> --
            Trust is built through positive interactions, verified identity, and
            community engagement. Reputation is context-specific and cannot be
            transferred or traded
          </li>
          <li>
            <strong className="text-foreground">Community moderation</strong> --
            Experienced, trusted community members may be granted moderation
            capabilities within their neighborhood. Moderators are expected to
            act in accordance with community guidelines
          </li>
          <li>
            <strong className="text-foreground">Appeals</strong> -- If your
            content is removed or your account is restricted by a community
            moderator, you may appeal the decision to the CivicForge team
          </li>
          <li>
            <strong className="text-foreground">No gaming</strong> -- Attempting
            to artificially inflate your reputation or trust tier (through fake
            interactions, multiple accounts, or collusion) is a violation of
            these terms
          </li>
        </ul>
      </section>

      {/* 7. Termination */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">7. Termination</h2>
        <p className="mt-4 text-muted-foreground">
          You may delete your account at any time through your account settings.
          We may also suspend or terminate your account if:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-muted-foreground">
          <li>You violate these Terms of Service</li>
          <li>
            You engage in behavior that harms other users or the community
          </li>
          <li>
            We are required to do so by law or to protect the safety of our
            users
          </li>
          <li>Your account has been inactive for more than 24 months</li>
        </ul>
        <p className="mt-4 text-muted-foreground">
          Upon termination, your right to use the platform ceases immediately.
          Data deletion follows the process described in our{" "}
          <Link
            href="/privacy"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      {/* 8. Disclaimers */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">8. Disclaimers</h2>
        <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">
              THE PLATFORM IS PROVIDED &ldquo;AS IS&rdquo;
            </strong>{" "}
            -- CivicForge is provided on an &ldquo;as is&rdquo; and &ldquo;as
            available&rdquo; basis without warranties of any kind, either express
            or implied.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">
              NO WARRANTY OF USER BEHAVIOR
            </strong>{" "}
            -- We do not vet, endorse, or guarantee the identity, qualifications,
            or behavior of any user. You interact with other users at your own
            risk. Exercise the same caution you would with any community
            interaction.
          </p>
          <p className="mt-3">
            <strong className="text-foreground">LIABILITY LIMITATION</strong> --
            To the maximum extent permitted by law, Wicks LLC shall not be liable
            for any indirect, incidental, special, consequential, or punitive
            damages arising from your use of CivicForge, including any
            interactions with other users facilitated by the platform.
          </p>
        </div>
      </section>

      {/* 9. Governing Law */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">9. Governing law</h2>
        <p className="mt-4 text-muted-foreground">
          These terms are governed by the laws of the State of Delaware, United
          States, without regard to conflict of law principles. Any disputes
          arising under these terms shall be resolved in the courts located in
          the State of Delaware.
        </p>
      </section>

      {/* 10. Changes to These Terms */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">10. Changes to these terms</h2>
        <p className="mt-4 text-muted-foreground">
          We may update these terms from time to time. When we make material
          changes, we will notify you via email and/or a prominent notice on
          the platform at least 30 days before the changes take effect. Your
          continued use of CivicForge after the effective date constitutes
          acceptance of the updated terms.
        </p>
      </section>

      {/* 11. Contact */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold">11. Contact us</h2>
        <p className="mt-4 text-muted-foreground">
          If you have questions about these terms, contact us at:
        </p>
        <p className="mt-4">
          <a
            href="mailto:legal@civicforge.org"
            className="text-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            legal@civicforge.org
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
