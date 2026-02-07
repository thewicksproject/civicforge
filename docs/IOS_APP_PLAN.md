# CivicForge iOS App Plan

Native SwiftUI app sharing the existing Supabase backend with the Next.js web application.

---

## 1. Architecture Overview

### Technology Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| UI | SwiftUI | Declarative, matches component-based web architecture |
| Architecture | MVVM + Repository | Lightweight, SwiftUI-native; avoids TCA complexity for a v1 |
| Backend | Supabase Swift SDK | First-party SDK covers Auth, Database (PostgREST), Storage, Realtime |
| Networking | supabase-swift (async/await) | Native concurrency, no Combine boilerplate |
| Image Processing | Core Image + ImageIO | EXIF stripping, resize, JPEG compression without third-party deps |
| Push Notifications | APNs via Supabase Edge Functions | No Firebase dependency; Supabase handles token storage |
| Minimum Target | iOS 17 | Covers 90%+ of active devices; enables Observation framework |
| Dependency Manager | Swift Package Manager | Standard, no CocoaPods/Carthage overhead |

### System Diagram

```
+------------------+        +------------------+
|   Next.js Web    |        |  SwiftUI iOS App |
|  (Vercel)        |        |  (App Store)     |
+--------+---------+        +--------+---------+
         |                           |
         |    Same credentials       |
         |    Same RLS policies      |
         v                           v
+--------+---------------------------+---------+
|              Supabase Project                 |
|                                               |
|  +----------+  +---------+  +-------------+  |
|  | Auth     |  | PostgREST|  | Storage     |  |
|  | (GoTrue) |  | (REST)  |  | (S3-compat) |  |
|  +----------+  +---------+  +-------------+  |
|  +----------+  +---------+                    |
|  | Realtime |  | Edge Fn |                    |
|  | (WS)     |  | (APNs)  |                    |
|  +----------+  +---------+                    |
|                                               |
|  +------------------------------------------+|
|  | PostgreSQL + Row Level Security           ||
|  | (14 tables, identical policies for both   ||
|  |  web and mobile clients)                  ||
|  +------------------------------------------+|
+-----------------------------------------------+
```

Both clients authenticate through the same Supabase Auth service, receive the same JWT, and hit the same PostgREST API with identical RLS enforcement. No backend changes are required for the iOS app to function.

### Why MVVM over TCA

TCA (The Composable Architecture) provides strong unidirectional data flow and testability, but introduces significant learning curve and boilerplate for a small team shipping v1. MVVM with the Swift Observation framework (`@Observable`) gives us:

- Direct SwiftUI integration with no wrapper types
- Familiar patterns for any Swift developer joining the project
- Easy migration path to TCA later if state management complexity grows
- Smaller dependency footprint (zero third-party architecture deps)

The Repository pattern sits between ViewModels and the Supabase SDK, making the data layer testable and swappable.

---

## 2. Feature Parity Matrix

| Feature | Web (Current) | iOS v1 | iOS Future | Notes |
|---------|:---:|:---:|:---:|-------|
| Browse board | Yes | Yes | -- | Main tab, pull-to-refresh |
| Filter posts (all/needs/offers) | Yes | Yes | -- | Segmented control |
| Post detail view | Yes | Yes | -- | Full post + photos + responses |
| Create post (need/offer) | Yes | Yes | -- | Category, urgency, availability |
| Respond to posts | Yes | Yes | -- | Trust tier 2+ gating |
| Photo upload | Yes (gallery) | Yes (camera + gallery) | -- | Native camera is iOS advantage |
| AI matching | Yes | Yes | -- | Calls same `/api/ai/` endpoints |
| Thanks / reputation | Yes | Yes | -- | Send thanks, view reputation badge |
| Flag posts | Yes | Yes | -- | Same flagging + auto-hide at threshold |
| Onboarding (3 steps) | Yes | Yes | -- | Name, neighborhood, invite code |
| Auth: magic link | Yes | Yes | -- | Universal links to handle callback |
| Auth: Google OAuth | Yes | Yes | -- | Native Google Sign-In SDK or ASWebAuthenticationSession |
| Push notifications | No | Yes | -- | iOS-exclusive; APNs for new responses, thanks, matches |
| Settings / profile edit | Yes | Yes | -- | Display name, bio, skills, phone verification |
| Sign out | Yes | Yes | -- | -- |
| Invite code redemption | Yes | Yes | -- | Enter code to upgrade to tier 2 |
| Admin review queue | Yes | -- | Yes | Web-only initially; complex moderation UI |
| Data export (JSON) | Yes | -- | Yes | Share sheet export in future |
| Account deletion | Yes | -- | Yes | Requires web confirmation flow initially |
| Neighborhood management | Yes | -- | Yes | Create/edit neighborhoods, member list |
| Phone verification | Yes | -- | Yes | Requires SMS API integration |
| Dark mode | Yes | Yes | -- | System setting respected |
| Offline browsing | No | -- | Yes | Cache board locally |

---

## 3. Shared Backend Assessment

### Supabase Swift SDK Capabilities

The `supabase-swift` package (v2.x) covers all four pillars needed:

| Capability | SDK Support | CivicForge Usage |
|-----------|:-----------:|------------------|
| **Auth** (GoTrue) | Full | Magic link OTP, Google OAuth, session management, `getUser()` |
| **Database** (PostgREST) | Full | All 14 tables via typed queries; RLS enforced automatically |
| **Storage** | Full | Upload to `post-photos` bucket; download signed URLs |
| **Realtime** | Full | Subscribe to `posts` and `responses` changes in user's neighborhood |

### Auth Flows on iOS

**Magic Link (Email OTP)**

1. User enters email in the app
2. App calls `supabase.auth.signInWithOTP(email:redirectTo:)`
3. `redirectTo` is a universal link: `https://civicforge.org/auth/callback`
4. User taps link in email; iOS opens the app via universal link
5. App extracts the token from the URL and calls `supabase.auth.session(from:)` to complete sign-in
6. Fallback: if universal link fails, show a "paste your code" field for the 6-digit OTP

**Google OAuth**

Option A (recommended): Use `ASWebAuthenticationSession` to open the Supabase Google OAuth URL in a system browser sheet. This avoids adding the Google Sign-In SDK as a dependency and works with Supabase's existing OAuth flow.

Option B: Native Google Sign-In SDK (`GoogleSignIn-iOS`). Provides a smoother UX with the native Google account picker but adds a 3MB dependency and requires Google Cloud Console configuration for the iOS client ID.

Recommendation: Start with Option A for v1. Evaluate Option B if user feedback indicates friction.

### RLS Policy Compatibility

All 13 tables have RLS enabled with policies keyed on `auth.uid()`. The Supabase Swift SDK sends the same JWT as the web client, so every policy works identically:

- `profiles_select_same_neighborhood` -- neighborhood-scoped reads
- `posts_insert_tier2` -- trust tier enforcement
- `responses_insert_tier2` -- trust tier enforcement
- `storage_post_photos_insert_own` -- user-scoped upload folders
- All other SELECT/INSERT/UPDATE/DELETE policies

No policy modifications are needed for iOS. The service role key is never embedded in the iOS app.

### Realtime Strategy

Two approaches for keeping the board fresh:

| Approach | Latency | Battery | Complexity |
|----------|---------|---------|------------|
| **Pull** (pull-to-refresh + periodic fetch) | Seconds | Low | Low |
| **Push** (Supabase Realtime WebSocket) | Instant | Medium | Medium |
| **Hybrid** (pull + Realtime for active screen) | Instant when viewing | Low when backgrounded | Medium |

Recommendation: **Hybrid**. Use Realtime subscriptions only while the Board or Post Detail screens are active. Disconnect when the app backgrounds. Use pull-to-refresh as the baseline everywhere.

### Storage: Direct Upload from Camera

The Supabase Storage SDK supports uploading `Data` directly:

```swift
// Pseudocode for photo upload flow
let imageData = processPhoto(capturedImage) // strip EXIF, resize, compress
let path = "\(userId)/\(UUID().uuidString).jpg"
try await supabase.storage
    .from("post-photos")
    .upload(path: path, file: imageData, options: .init(contentType: "image/jpeg"))
```

The existing RLS storage policies enforce that uploads go into the user's own folder (`{user_id}/*`), which works identically from iOS.

---

## 4. iOS-Specific Considerations

### App Store Review Requirements

Apple requires apps with user-generated content to implement:

- **Content moderation**: Already implemented. The web app has flagging (`postFlags` table), auto-hide at 3 flags (`FLAG_THRESHOLD_HIDE`), admin review queue, and AI-assisted review status. The iOS app reads the same `hidden` and `review_status` fields.
- **Blocking/reporting**: The `FlagButton` component maps to an iOS report action. Add a block-user feature (client-side filter) for v1.
- **Age gate**: The login page already confirms users are 18+. Replicate this in the iOS onboarding.
- **EULA acceptance**: Add terms/privacy acceptance to the onboarding flow before account creation.

### Push Notifications

Architecture:

```
iOS App                  Supabase                    APNs
  |                        |                           |
  |-- Register device ---->|                           |
  |   (store APNs token    |                           |
  |    in device_tokens    |                           |
  |    table)              |                           |
  |                        |                           |
  |                        |<-- DB trigger fires -->   |
  |                        |   (new response,          |
  |                        |    new thanks,             |
  |                        |    new AI match)           |
  |                        |                           |
  |                        |-- Edge Function --------->|
  |                        |   sends APNs payload      |
  |                        |                           |
  |<--------- Push notification ----------------------|
```

Required backend additions:

1. New `device_tokens` table: `(id, user_id, token, platform, created_at)`
2. Supabase Edge Function: listens to database webhooks, sends APNs requests
3. APNs key: stored as Supabase secret (`.p8` key from Apple Developer portal)

Notification triggers:

| Event | Recipient | Priority |
|-------|-----------|----------|
| New response to your post | Post author | High |
| Response accepted/declined | Responder | High |
| Thanks received | Recipient | Medium |
| AI match found | Post author | Low |

### Offline Behavior

v1 scope (minimal):

- Cached board data displayed when offline with a banner indicating stale data
- Post creation queued locally and submitted when connectivity returns
- Auth token cached securely in Keychain

Future:

- Full offline-first with local SQLite mirror via GRDB or SwiftData
- Conflict resolution for queued mutations

### Deep Linking (Universal Links)

Required for magic link auth and future share-a-post links:

1. **Apple App Site Association (AASA) file**: Host at `https://civicforge.org/.well-known/apple-app-site-association`
2. **Associated Domains entitlement**: `applinks:civicforge.org`
3. **URL patterns**:
   - `/auth/callback` -- magic link sign-in completion
   - `/board/{postId}` -- deep link to specific post
   - `/invite/{code}` -- deep link to redeem invitation

### Haptics and Native Feel

- Light haptic on "Thanks" button tap (success feedback)
- Medium haptic on post creation success
- Selection haptic on filter tab changes
- Pull-to-refresh with native `UIRefreshControl` bounce
- Swipe-to-go-back on navigation stack
- Context menus (long press) on post cards for quick actions (flag, share)

---

## 5. Design System Translation

### Color Mapping

The web app uses OKLCH colors. iOS uses `UIColor`/SwiftUI `Color` which work in Display P3 and sRGB. Convert OKLCH values to sRGB hex for the asset catalog, with Display P3 variants for wider gamut devices.

| Token | Web (OKLCH) | iOS (sRGB Hex) | iOS (Display P3) | Usage |
|-------|-------------|----------------|-------------------|-------|
| Golden Hour | `oklch(0.81 0.1 75)` | `#DEBA85` | P3(0.87, 0.73, 0.52) | Accent, reputation |
| Warm White | `oklch(0.99 0.005 90)` | `#FEFDFB` | -- | Background (light) |
| Cream | `oklch(0.96 0.015 85)` | `#F5F0E8` | -- | Card background |
| Charcoal | `oklch(0.25 0.01 260)` | `#2D2F3A` | -- | Foreground text |
| Meadow | `oklch(0.78 0.15 140)` | `#5CBF6E` | P3(0.36, 0.75, 0.43) | Primary (offers) |
| Meadow Light | `oklch(0.92 0.06 140)` | `#D4F0D8` | -- | Offer badge bg |
| Rose Clay | `oklch(0.72 0.12 40)` | `#D4896A` | P3(0.83, 0.54, 0.42) | Needs |
| Rose Clay Light | `oklch(0.92 0.04 40)` | `#F5E6DD` | -- | Need badge bg |
| Horizon | `oklch(0.72 0.12 230)` | `#5A9CC5` | P3(0.35, 0.61, 0.77) | Events, civic |
| Destructive | `oklch(0.6 0.2 25)` | `#CC4433` | -- | Errors, danger zone |

Define these in a Swift `Color` extension and in the Xcode asset catalog with light/dark variants.

**Dark mode**: Map the CSS `.dark` theme variables to iOS dark appearance colors in the asset catalog. The dark background (`oklch(0.15 0.01 260)`) maps to approximately `#1E1F26`.

### Typography Mapping

| Web | iOS Equivalent | Implementation |
|-----|----------------|----------------|
| Charter serif (headings) | `Georgia` or `.serif` design | `Font.system(.title, design: .serif)` or a custom `Charter` font bundled in the app |
| system-ui (body, 17px) | SF Pro (system default, 17pt) | `Font.body` (17pt is the iOS default body size) |
| line-height: 1.7 | `.lineSpacing(7)` on body text | SwiftUI `lineSpacing` modifier |
| font-weight: 600 | `.semibold` | `Font.system(.title, weight: .semibold)` |

Recommendation: Bundle Charter as a custom font (it is freely available) to maintain brand consistency. Fall back to `Georgia` or `.serif` design if licensing is unclear.

### Spacing and Layout

| Web (Tailwind) | iOS (SwiftUI) | Notes |
|----------------|---------------|-------|
| `gap-2` (8px) | `.spacing: 8` | Use multiples of 4 |
| `gap-4` (16px) | `.spacing: 16` | Standard iOS spacing |
| `gap-6` (24px) | `.spacing: 24` | Section spacing |
| `p-4` (16px) | `.padding(16)` | Card internal padding |
| `p-5` (20px) | `.padding(20)` | Section padding |
| `p-6` (24px) | `.padding(24)` | Header padding |
| `rounded-xl` (12px) | `.cornerRadius(12)` | Card corners, matches `--radius: 0.75rem` |
| `rounded-full` | `.clipShape(Capsule())` | Badges, pills |
| `max-w-2xl` (672px) | Full width, `padding(.horizontal, 16)` | iOS uses full width with edge padding |

### Component Mapping

| Web Component | iOS Component | Notes |
|---------------|---------------|-------|
| `<PostCard>` | `PostCardView` | Card with cream bg, 12px radius, shadow on press |
| `<Button>` (shadcn) | `CivicButton` | Custom styled `Button` with Meadow primary |
| `<Input>` (shadcn) | `TextField` with custom style | Bordered, rounded, matching web input |
| `<Textarea>` (shadcn) | `TextEditor` with border overlay | Multi-line input |
| `<Select>` | `Picker` with `.menu` style | Category/urgency selection |
| `<ReputationBadge>` | `ReputationBadge` view | Golden Hour gradient text |
| `<PhotoUpload>` | `PhotosPicker` + `Camera` | Native iOS photo selection |
| Tab navigation | `TabView` | Bottom tab bar |
| Filter buttons | `Picker(.segmented)` | All/Needs/Offers |

---

## 6. Screen Inventory

### Tab Structure

```
TabView
  |-- BoardTab (house icon)
  |     |-- BoardView              /board
  |     |-- PostDetailView         /board/[postId]
  |     +-- CreatePostView         /post/new (presented as sheet)
  |
  |-- ProfileTab (person icon)
  |     |-- ProfileView            /profile
  |     +-- OtherProfileView       /profile/[userId]
  |
  +-- SettingsTab (gear icon)
        +-- SettingsView           /settings/privacy
```

### Screen-to-Route Mapping

| Web Route | iOS Screen | View Name | Presentation |
|-----------|-----------|-----------|--------------|
| `/login` | Sign In | `AuthView` | Full screen, no tabs |
| `/onboarding` | Onboarding | `OnboardingFlow` | Full screen, 3-step pager |
| `/board` | Needs Board | `BoardView` | Tab 1 root |
| `/board/[postId]` | Post Detail | `PostDetailView` | Push navigation |
| `/post/new` | Create Post | `CreatePostView` | Sheet (modal) from BoardView |
| `/profile` | My Profile | `ProfileView` | Tab 2 root |
| `/profile/[userId]` | Other Profile | `OtherProfileView` | Push navigation |
| `/settings/privacy` | Settings | `SettingsView` | Tab 3 root |
| -- (no web equivalent) | Notifications | `NotificationsView` | Future: Tab or badge overlay |

### Navigation Flow

```
App Launch
  |
  v
AuthView (if not signed in)
  |-- Magic Link flow
  |-- Google OAuth flow
  v
OnboardingFlow (if profile incomplete)
  |-- Step 1: Display Name
  |-- Step 2: Neighborhood (search or create)
  |-- Step 3: Invite Code (optional)
  v
Main TabView
  |-- Board -> PostDetail -> (respond / flag / thanks)
  |                      \-> OtherProfileView
  |-- Board -> CreatePost (sheet)
  |-- Profile -> Edit (inline or push)
  +-- Settings -> Sign Out / Delete Account
```

---

## 7. Technical Spike List

Each spike is a time-boxed investigation (1-2 days) to de-risk unknowns before full implementation.

### Spike 1: Supabase Swift Auth with Magic Links

**Goal**: Confirm magic link OTP flow works end-to-end on iOS with universal links.

**Tasks**:
- Set up universal links with AASA file on civicforge.org
- Implement `signInWithOTP` and handle the callback URL in `onOpenURL`
- Test on device (universal links require a real domain)
- Document fallback: 6-digit OTP code entry if link fails

**Risk**: Universal links can be unreliable on first install (before iOS verifies the AASA file). The OTP code fallback mitigates this.

### Spike 2: Camera + Photo Processing (EXIF Strip) in Swift

**Goal**: Replicate the web's Sharp pipeline using native iOS APIs.

**Tasks**:
- Capture photo via `UIImagePickerController` (camera) or `PhotosPicker` (gallery)
- Strip EXIF/GPS using `CGImageSourceCopyPropertiesAtIndex` with metadata removal
- Resize to max 1200px width using `CGImage` or `UIGraphicsImageRenderer`
- Generate 300x300 thumbnail with center crop
- Compress to JPEG at quality 80
- Upload both to Supabase Storage
- Verify no EXIF data in uploaded file using `exiftool`

**Risk**: Low. iOS has mature image processing APIs. The main concern is matching the exact output quality of the web's Sharp + mozjpeg pipeline.

### Spike 3: Push Notification Setup

**Goal**: End-to-end push notification from database event to iOS notification banner.

**Tasks**:
- Create APNs key in Apple Developer portal
- Create `device_tokens` table in Supabase with RLS
- Write Supabase Edge Function that receives a database webhook and sends APNs request
- Register for push in the iOS app, store token in `device_tokens`
- Trigger a test notification by inserting a response

**Risk**: Medium. APNs configuration has many moving parts (provisioning profiles, entitlements, key management). Budget extra time.

### Spike 4: Universal Links Configuration

**Goal**: Verify deep links work for auth callbacks and post sharing.

**Tasks**:
- Create and host AASA file at `civicforge.org/.well-known/apple-app-site-association`
- Configure Associated Domains entitlement in Xcode
- Test `/auth/callback` link opens the app
- Test `/board/{postId}` link navigates to PostDetailView
- Document CDN caching behavior (AASA files are cached by Apple's CDN)

**Risk**: Medium. AASA caching can cause delays in testing. Use Apple's AASA validator tool.

---

## 8. Project Structure

```
CivicForge/
  CivicForgeApp.swift                   # App entry point, tab setup
  Info.plist                            # Associated Domains, camera usage

  App/
    AppState.swift                      # Global auth state, navigation
    DeepLinkHandler.swift               # Universal link routing

  Features/
    Auth/
      Views/
        AuthView.swift                  # Login screen (magic link + Google)
        MagicLinkSentView.swift         # "Check your email" confirmation
      ViewModels/
        AuthViewModel.swift             # signInWithOTP, signInWithOAuth

    Onboarding/
      Views/
        OnboardingFlow.swift            # 3-step pager container
        NameStepView.swift              # Step 1: display name
        NeighborhoodStepView.swift      # Step 2: search or create
        InviteStepView.swift            # Step 3: invite code (skippable)
      ViewModels/
        OnboardingViewModel.swift

    Board/
      Views/
        BoardView.swift                 # Post list with filters
        PostCardView.swift              # Card component
        PostDetailView.swift            # Full post + photos + responses
        ResponseListView.swift          # Responses section
      ViewModels/
        BoardViewModel.swift            # Fetch posts, filter, realtime
        PostDetailViewModel.swift       # Fetch post detail, submit response

    Post/
      Views/
        CreatePostView.swift            # Form: type, title, desc, category, photos
        PhotoPickerView.swift           # Camera + gallery integration
      ViewModels/
        CreatePostViewModel.swift       # Validate, process photos, submit

    Profile/
      Views/
        ProfileView.swift               # Own profile (posts, thanks)
        OtherProfileView.swift          # View another user's profile
      ViewModels/
        ProfileViewModel.swift

    Settings/
      Views/
        SettingsView.swift              # Profile edit, privacy, sign out
      ViewModels/
        SettingsViewModel.swift

  Shared/
    Models/
      Post.swift                        # Codable struct matching posts table
      Profile.swift                     # Codable struct matching profiles table
      Response.swift                    # Codable struct matching responses table
      Thanks.swift                      # Codable struct matching thanks table
      Neighborhood.swift                # Codable struct matching neighborhoods table
      PostPhoto.swift                   # Codable struct matching post_photos table
      Invitation.swift                  # Codable struct matching invitations table
      Enums.swift                       # PostType, PostStatus, UrgencyLevel, etc.

    Services/
      SupabaseClient.swift              # Singleton Supabase client config
      AuthService.swift                 # Auth operations (login, logout, session)
      PostRepository.swift              # CRUD for posts + photos
      ResponseRepository.swift          # CRUD for responses
      ProfileRepository.swift           # CRUD for profiles
      ThanksRepository.swift            # Send/fetch thanks
      NeighborhoodRepository.swift      # Search/create neighborhoods
      InvitationRepository.swift        # Redeem invite codes
      PhotoProcessor.swift              # EXIF strip, resize, compress, thumbnail
      PushNotificationService.swift     # APNs registration, token management

    Components/
      CivicButton.swift                 # Primary/secondary/destructive button styles
      ReputationBadge.swift             # Golden Hour gradient score display
      TrustTierLabel.swift              # "Neighbor" / "Confirmed" / "Verified"
      PostTypeBadge.swift               # Need (rose) / Offer (meadow) pill
      UrgencyBadge.swift                # Low/medium/high urgency indicator
      CategoryLabel.swift               # Post category display
      AvatarView.swift                  # Circular avatar with initial fallback
      EmptyStateView.swift              # Reusable empty state with icon + CTA
      LoadingView.swift                 # Consistent loading indicator
      ErrorBanner.swift                 # Inline error display
      FlagButton.swift                  # Report/flag action
      ThanksButton.swift                # Send thanks action
      AiBadge.swift                     # AI-assisted indicator

    Extensions/
      Color+CivicForge.swift            # Design system colors
      Font+CivicForge.swift             # Charter serif + system body
      Date+Relative.swift               # "2 hours ago" formatting
      View+CardStyle.swift              # Card modifier (cream bg, radius, shadow)

  Resources/
    Assets.xcassets/                     # Colors, app icon, images
    Charter.ttc                         # Charter font file (if bundled)
    Localizable.strings                 # String catalog for future i18n
```

---

## 9. Milestone Breakdown

### M1: Project Setup + Auth (2 weeks)

**Week 1**:
- Create Xcode project with SwiftUI lifecycle
- Add `supabase-swift` package dependency
- Configure `SupabaseClient.swift` with project URL and anon key
- Set up `Associated Domains` entitlement
- Create and host AASA file on civicforge.org
- Implement `AuthView` with magic link email input
- Implement `MagicLinkSentView` confirmation screen

**Week 2**:
- Implement universal link handling in `onOpenURL` for magic link callback
- Add 6-digit OTP fallback entry
- Implement Google OAuth via `ASWebAuthenticationSession`
- Implement `AuthService` with session persistence (Keychain)
- Set up `AppState` for global auth observation
- Add sign-out functionality
- Write unit tests for `AuthService`

**Deliverable**: User can sign in via magic link or Google, session persists across launches, sign out works.

### M2: Board + Post Detail (2 weeks)

**Week 3**:
- Define `Post`, `Profile`, `Response`, `PostPhoto` Codable models
- Implement `PostRepository` with neighborhood-scoped fetch
- Build `BoardView` with `List` and `PostCardView` cells
- Implement pull-to-refresh
- Add segmented filter control (All / Needs / Offers)
- Set up design system: `Color+CivicForge`, `Font+CivicForge`, card style modifier

**Week 4**:
- Implement `PostDetailView` with full post content, photos, author card
- Build `ResponseListView` showing responses (for post author) or response form (for others)
- Implement `ResponseRepository` for submitting and listing responses
- Add `ThanksButton` and `FlagButton` actions
- Implement `ReputationBadge` with Golden Hour gradient
- Connect Realtime subscription for live post updates on Board screen
- Write unit tests for `PostRepository`

**Deliverable**: User can browse the board, filter by type, view post details, see responses, submit a response, send thanks, and flag posts.

### M3: Create Post + Photos (2 weeks)

**Week 5**:
- Build `CreatePostView` form with type toggle, title, description, category picker, urgency
- Implement `PhotoPickerView` with `PhotosPicker` (gallery) and camera capture
- Implement `PhotoProcessor`: EXIF strip, resize to 1200px max, thumbnail at 300px, JPEG quality 80
- Upload processed photos to Supabase Storage `post-photos` bucket

**Week 6**:
- Wire up `CreatePostViewModel` to validate and submit the post + photos
- Handle the `ai_assisted` flag (future: call AI endpoint for title/description suggestions)
- Add available times and location hint optional fields
- Implement success feedback with haptics and navigation back to board
- Implement trust tier gating (tier 2+ required to post, show upgrade prompt for tier 1)
- Write unit tests for `PhotoProcessor` and `CreatePostViewModel`

**Deliverable**: User can create a need or offer post with up to 4 photos from camera or gallery. Photos are EXIF-stripped and properly sized.

### M4: Onboarding + Profile + Settings (1 week)

**Week 7**:
- Build `OnboardingFlow` with 3-step pager (name, neighborhood, invite code)
- Implement `NeighborhoodRepository` for searching and creating neighborhoods
- Implement `InvitationRepository` for redeeming invite codes
- Build `ProfileView` showing own posts and thanks received
- Build `OtherProfileView` for viewing other users
- Build `SettingsView` with profile edit form, invite code entry, sign out, account deletion prompt
- Implement dark mode support throughout all screens

**Deliverable**: New users complete onboarding. Existing users can view/edit profile, view other profiles, manage settings.

### M5: Push Notifications + Polish (2 weeks)

**Week 8**:
- Create `device_tokens` table + RLS policy in Supabase
- Write Supabase Edge Function for APNs delivery
- Set up database webhooks for response/thanks/match events
- Implement `PushNotificationService` in the app (registration, token storage)
- Configure APNs key and entitlements

**Week 9**:
- Handle notification taps with deep linking to relevant screens
- Implement notification preferences (which events to receive)
- UI polish pass: animations, transitions, loading states, error handling
- Accessibility audit: VoiceOver labels, Dynamic Type support, contrast ratios
- Performance optimization: image caching, lazy loading, memory profiling
- Edge case handling: no network, expired sessions, deleted posts

**Deliverable**: Push notifications work for key events. App is polished, accessible, and handles edge cases gracefully.

### M6: TestFlight + App Store Submission (1 week)

**Week 10**:
- Internal TestFlight build distributed to team
- Write App Store metadata: description, keywords, screenshots (6.7", 6.1", iPad if applicable)
- Prepare privacy nutrition label (data collection disclosures)
- Create App Store Connect listing
- Address TestFlight feedback
- Submit for App Store review
- Prepare a response document for potential review rejections (UGC moderation evidence)

**Deliverable**: App submitted to App Store review.

---

## 10. Dependencies

### Swift Packages

| Package | Version | Purpose |
|---------|---------|---------|
| `supabase-swift` | 2.x | Auth, Database, Storage, Realtime |
| `swift-dependencies` | -- | Only if migrating to TCA later |

Intentionally minimal. No image loading library (use native `AsyncImage`), no networking library (Supabase SDK handles it), no analytics SDK (privacy-first).

### Backend Additions Required

| Item | Type | Milestone |
|------|------|-----------|
| `device_tokens` table + RLS | Migration | M5 |
| APNs Edge Function | Supabase Edge Function | M5 |
| AASA file hosting | Vercel static file | M1 |
| Database webhook for notifications | Supabase Dashboard config | M5 |

### Apple Developer Requirements

| Item | When Needed |
|------|-------------|
| Apple Developer Program membership ($99/year) | M1 |
| App ID with Associated Domains capability | M1 |
| APNs authentication key (.p8) | M5 |
| App Store Connect listing | M6 |

---

## 11. Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Universal links unreliable on first install | Medium | Medium | OTP code fallback for magic link auth |
| App Store rejection for UGC without moderation | Low | High | Moderation already built (flagging, auto-hide, review queue); document it in review notes |
| Supabase Swift SDK bugs or missing features | Low | Medium | SDK is mature (v2); fallback to raw PostgREST HTTP calls |
| OKLCH to sRGB color conversion inaccuracy | Low | Low | Validate colors visually on device; use Display P3 for wider gamut |
| Push notification delivery reliability | Medium | Medium | Don't rely on push alone; always support pull-to-refresh |
| Photo processing performance on older devices | Low | Low | Process on background thread; show progress indicator |
