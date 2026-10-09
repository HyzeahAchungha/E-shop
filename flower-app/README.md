# Flower Shop

An iOS and Android app built with Expo, React Native, TypeScript, and Expo Router. This project lives alongside the existing `../e-commerce` website.

## Run

Use Node.js 24 and npm 11 (verified with Node 24.14.1 and npm 11.11.0).

```sh
npm ci
npm start
```

Use an Expo development build for Clerk authentication and social callbacks. The local artwork screens can also be previewed in Expo Go compatible with SDK 57. `npm run android` opens a connected Android device/emulator; `npm run ios` requires macOS with an iOS simulator.

## Current screens

The splash screen is the entry route. It uses a local rose logo, original floral line artwork, Inter SemiBold, and the supplied palette. Artwork sources are in `assets/artwork/`; the app uses PNG exports for predictable native rendering. The splash, welcome and onboarding artwork are local. Signup uses Clerk when its public application key is configured.

The OS launch screen uses the purple logo on white. Once the bundled font is ready, the app displays the full floral design. A system font fallback allows launch if the font cannot load. The operating system controls its launch screen presentation; verify this in a release build, as Expo Go and development builds do not fully reproduce it.

The splash is approved. On normal launch, its first layout starts a 1.5-second display period, then Expo Router replaces it with `/welcome`; going back does not reopen the splash. The timeout is cleared if the splash unmounts. The root layout loads Inter Regular and SemiBold for both routes and also releases the native launch screen when `/welcome` is opened directly.

The approved welcome screen uses two bundled flower portraits, the supplied colors, rounded hashtag labels, and the approved copy: “Fresh flowers for every occasion, delivered with care to your doorstep.” It supports scrolling on small displays and with enlarged text. Sources for the photos are in `assets/artwork/README.md`.

“Let’s Get Started” opens `/onboarding`. “Sign In” opens `/signin`; its Clerk authentication is configured as described below. First-time launches show splash → welcome. After the user finishes the final onboarding slide, later launches show splash → signup.

`/onboarding` is the first slide, titled “Craft Your Ultimate Floral Collection.” It has the first of three progress dots active, decorative wishlist phone artwork, and the approved description: “Save your favorite flowers and bouquets, and keep every beautiful find in one place.” The phone's products, prices, ratings, hearts, and tabs are illustrative sample content, not a working wishlist or backend data.

Back on slide 1 dismisses to welcome, including when opened directly. Both Skip and Next open `/onboarding-shopping`.

Slide 2 is “Seamless Flower Shopping Experience,” with the middle progress dot active and the approved description: “Discover beautiful blooms, explore special offers, and find the perfect flowers for every occasion.” The decorative phone depicts a fictional shop, special offer, and recommended products. It is not a functional shopping screen or live product data.

Slide 2's Back button dismisses to slide 1, including from a direct link. Both Skip and Next open `/onboarding-delivery`.

Slide 3 is “From Cart to Door: Swift & Reliable Flower Delivery,” with the third dot active, no Skip button, and decorative tracking artwork. Its description is “Track your order every step of the way, from your favorite florist to your doorstep.” Back returns to slide 2. The final arrow saves onboarding completion before resetting the navigation stack to `/signup`.

`src/store/onboarding.ts` uses Expo-compatible AsyncStorage for the non-sensitive device-local flag `@flower-shop/onboarding-completed-v1`. A missing or unrecognized value is incomplete. Interrupted onboarding remains incomplete. A failed write keeps the user on slide 3 with a retry message; buttons are disabled while saving, and repeated taps cannot create concurrent saves. If reading storage fails at startup, the app falls back to the first-time flow rather than getting stuck. Clearing app data removes the flag; reinstall behavior depends on the platform's backup settings.

## Signup and Clerk setup

`app/(auth)/signup.tsx` now renders the Create Account reference, with Name, Email, Password, password visibility, an initially unchecked terms checkbox, Sign Up, Apple/Google/Facebook buttons, and Sign In. Empty names, invalid email addresses, passwords shorter than eight characters and unchecked terms are rejected locally; Clerk enforces the application’s password and account rules. Requests are serialized and controls lock during submission. Terms content currently shows an explicit pending message; Sign In opens `/signin`.

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` from your Clerk dashboard. Restart Metro after changing environment variables. The form remains reviewable without a key and explicitly reports that account creation is unavailable; it never creates a fake account.

Configure Clerk for email/password signup, email verification codes, and first/last names. Enable Apple, Google and Facebook and finish their provider configuration. Allow `flower-shop://signup` and `flower-shop://signin` as mobile redirect URLs. Test social authentication in an iOS/Android development build with the `flower-shop` scheme; the web preview supports layout and form review only. The Clerk Expo plugin configures native integration and requires iOS 17 or later. Apple uses browser OAuth here, so native Apple entitlements are not added. Session tokens use Clerk’s encrypted Expo SecureStore cache on native, never AsyncStorage.

Email signup calls Clerk’s supported custom-flow API to create a pending signup and send an email code. If code delivery fails, Retry sending code retries delivery against the same signup. On success the form opens `/verify-code` with the pending Clerk signup. Back returns to signup, where Continue to verification reopens the existing attempt without creating another account or resending a code. The email flow activates a session only after Clerk confirms completion on the verification screen.

Social signup activates a session only when Clerk returns a completed session. Cancellation leaves the form usable. If Clerk requires email verification, it sends the code; other incomplete requirements show a pending-step message. Authenticated users see an explicit message because the post-auth destination has not been supplied. Terms and the post-auth destination await separate references/requirements. The checkbox is currently UI consent only; published terms and any required Clerk legal-consent configuration must be completed before release. No legal agreement is recorded in metadata.

The onboarding completion flag is never an authentication or authorization check. Clerk sessions will be used by the future secure backend to authorize private data.

All three slides reuse `src/components/ui/OnboardingSlide.tsx` for layout, progress accessibility, and controls. Route files own their content and navigation.

## Structure

- `app/`: Expo Router routes and root layout.
- `src/components/ui/`: shared UI, currently the branded splash.
- `src/theme/`: supplied colors and typography.
- `assets/`: local branding artwork and images.

Add the agreed auth, tabs, feature, store, API, and type folders as their screens are implemented. The existing website is independent.

## Checks

```sh
npm run typecheck
npm run lint
npm run test:auth
npx expo-doctor
npm run export:native
```

For browser-based visual inspection only, run `npm run preview:ui`. React DOM and React Native Web are development dependencies; the app's configured shipping platforms remain iOS and Android. A browser preview cannot verify the native OS splash, system bars, or physical-device behavior.

## Upcoming services

Clerk signup is integrated as described above. A secure server API backed by Neon PostgreSQL will be connected when shopping screens are defined. Keep Neon credentials and Clerk secret keys exclusively on the backend. Never connect this app directly to Neon. `.env.example` documents the boundary; there are no mock API calls in the current screen.

## Verification limits

TypeScript, lint, Expo Doctor (21 checks), and Metro exports for iOS and Android pass. The browser preview was inspected at 320×568, 393×852, and 768×1024. Native device startup and the OS launch screen still need verification on an Android device/emulator and an iOS device/simulator; this Linux sandbox has neither available.

The initial dependency audit reports 30 advisories (19 high, 11 moderate) inherited through the Expo/React Native dependency tree, including braces, node-forge, decode-uri-component, and uuid. Clerk adds one affected-package entry through the existing Expo/React Native advisories. These remain unresolved; npm's proposed fixes include incompatible SDK downgrades. Recheck compatible upstream fixes before release.

Live Clerk email delivery and native OAuth callbacks are not verified in this sandbox: its public key is unconfigured and no native device is available. CodeRabbit Emulate v0.0.1 includes Clerk backend/OAuth APIs but lacks the Frontend API client/sign-up/verification endpoints needed by the Expo SDK.

## Email verification

`app/(auth)/verify-code.tsx` matches the Verify Code reference with six boxes for Clerk’s six-digit email code. The displayed address comes from the pending Clerk signup; it is never accepted from a URL or replaced with a fabricated account. Opening the route without a pending signup shows a signup prompt and cannot authenticate or resend a code.

Typing advances to the next box. Backspace from an empty box clears and focuses the previous digit. Paste and OS autofill accept the full code, including when another box has focus. Nondigits are filtered. Verify is the only submission action; filling all six digits or dismissing the keyboard never verifies automatically. Validation and provider errors are visible, and verification/resend share a request lock.

The resend countdown starts after successful code delivery and lasts 60 seconds. Its in-memory timestamp is scoped to the Clerk signup ID and survives Back/Continue navigation. Elapsed wall time is recalculated when the app returns to the foreground. A resend failure does not reset the countdown or clear the entered code; success resets it and clears the old code. This timer is a UI convenience, and Clerk’s server still enforces rate limits. App process restart can reset this local timer; neither the code nor the email/password/token is persisted by the timer store.

Clerk’s `attemptEmailAddressVerification` must return a complete signup and a session before the app calls `setActive`. Invalid/expired codes, incomplete account requirements and activation failures never report success. If activation fails after verification, the user can retry activation without verifying the consumed code again. Successful verification displays a confirmation while the next screen awaits its reference. An already signed-in user sees a separate existing-session message.

The verification screenshot in Outputs uses a synthetic email from a temporary test fixture. That fixture is removed from the app; production UI contains no mocked authentication or account details. Live Clerk verification/resend and native OTP autofill/keyboard behavior remain unverified until a real Clerk public key and native device are available.

## Sign In

`app/(auth)/signin.tsx` matches the Sign In reference with Email, Password, password visibility, Forgot Password, the purple Sign In button, Apple/Google/Facebook and Sign Up. Welcome and signup Sign In links open this screen; Sign Up dismisses to signup, including from a direct link. Signup and sign-in share `AuthField` and `AuthSocialSection` without changing the agreed folder structure or adding dependencies.

Email sign-in validates the email and requires a nonempty password. It does not apply signup password-length rules to an existing account. Email whitespace is trimmed for Clerk; the password is passed exactly as entered and never persisted or logged. Clerk’s supported password sign-in API must report `complete` and return a session before activation. Invalid credentials and additional first-factor, second-factor or client-trust verification requirements cannot report success; extra verification screens await their references. Failed activation for the same verified identifier can be retried without submitting credentials again; a changed email starts a new attempt.

Social sign-in uses the enabled Clerk providers with `flower-shop://signin` as the callback. Cancelled and incomplete flows remain usable. Only a returned session that activates successfully is treated as signed in. Browser rendering is a UI review tool; native social callbacks require a development build. Signup or additional verification may be required by Clerk for a new social account.

Buttons lock during requests and repeated presses cannot create concurrent email/social requests. Successful authentication clears the password and shows a confirmation while the next screen is pending. Existing signed-in sessions display a separate message. Forgot Password currently shows an explicit pending message until its screen is provided. App startup still follows the approved splash/onboarding/signup rules.

The shipping screen contains no mocked sign-in. Action tests and temporary UI fixtures use synthetic identities and resources; fixtures are removed before native exports. Live password sign-in, provider errors, client-trust/MFA and social callbacks remain unverified here because the public application key and native device are unavailable. The previously inspected Clerk emulator does not implement the Frontend API sign-in endpoints required by this SDK.
