# CivicForge Email Setup Guide

Custom SMTP and branded email templates for auth flows (magic link, confirmation, password recovery).

## 1. Resend Setup

1. Create an account at [resend.com](https://resend.com)
2. Add the `civicforge.org` domain under **Domains**
3. Generate an API key under **API Keys** — save it securely

## 2. DNS Records (Cloudflare)

Add the following records for `civicforge.org`:

### SPF (update existing TXT record)

| Type | Name | Content |
|------|------|---------|
| TXT | `@` | `v=spf1 include:amazonses.com ~all` |

> Resend sends via Amazon SES, so the SPF `include` targets `amazonses.com`.

### DKIM (3 CNAME records from Resend)

Resend provides 3 CNAME records when you add your domain. Add all three in Cloudflare:

| Type | Name | Content |
|------|------|---------|
| CNAME | *(provided by Resend)* | *(provided by Resend)* |
| CNAME | *(provided by Resend)* | *(provided by Resend)* |
| CNAME | *(provided by Resend)* | *(provided by Resend)* |

### DMARC

| Type | Name | Content |
|------|------|---------|
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:dmarc@civicforge.org` |

### Domain Verification

Resend also provides a TXT verification record — add it as instructed in their dashboard.

## 3. Supabase Dashboard — Custom SMTP

Configure in **both** the dev and prod Supabase projects:

1. Go to **Project Settings > Authentication > SMTP Settings**
2. Enable **Custom SMTP**
3. Enter:

| Field | Value |
|-------|-------|
| Host | `smtp.resend.com` |
| Port | `465` |
| Minimum interval | `60` seconds |
| Sender email | `hello@civicforge.org` |
| Sender name | `CivicForge` |
| Username | `resend` |
| Password | *(your Resend API key)* |

## 4. Paste Email Templates

1. Go to **Authentication > Email Templates** in the Supabase Dashboard
2. For each template type, paste the corresponding HTML from `supabase/templates/`:

| Template | File | Subject Line |
|----------|------|-------------|
| Magic Link | `magic-link.html` | `Sign in to CivicForge` |
| Confirm signup | `confirmation.html` | `Confirm your CivicForge email` |
| Reset password | `recovery.html` | `Reset your CivicForge password` |

> The templates use `{{ .ConfirmationURL }}` and `{{ .Token }}` — Supabase's Go template variables. Do not modify these placeholders.

## 5. Testing Checklist

After configuring SMTP and templates:

- [ ] Send a test magic link email from the app
- [ ] Verify email arrives in inbox (not spam) for Gmail
- [ ] Verify email arrives in inbox for Outlook
- [ ] Verify email arrives in inbox for Apple Mail
- [ ] Verify sender shows `CivicForge <hello@civicforge.org>`
- [ ] Verify subject line shows correctly
- [ ] Verify CivicForge branding renders (wordmark, colors, button)
- [ ] Verify CTA button links work and complete sign-in flow
- [ ] Verify OTP code displays in the monospace code box
- [ ] Verify Wicks LLC footer link goes to thewicksproject.org
- [ ] Verify Privacy and Terms footer links work
- [ ] Check email size is under 10KB (Gmail clips at 102KB)

## Notes

- **No tracking pixels** — aligns with CivicForge's privacy-by-design principles
- **No external images** — everything is inline text/CSS for maximum compatibility
- Templates are version-controlled in `supabase/templates/` but must be manually pasted into the Dashboard (Supabase hosted projects don't read `config.toml` template paths)
- The `config.toml` template paths work with `supabase start` for local development
