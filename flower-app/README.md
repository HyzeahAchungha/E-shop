# Flower Shop

An iOS and Android app built with Expo, React Native, TypeScript, and Expo Router. This project lives alongside the existing `../e-commerce` website.

## Run

Use Node.js 24 and npm 11 (verified with Node 24.14.1 and npm 11.11.0).

```sh
npm ci
npm start
```

Open the project in Expo Go compatible with SDK 57, or use an Expo development build. `npm run android` opens a connected Android device/emulator; `npm run ios` requires macOS with an iOS simulator.

## Current screens

The splash screen is the entry route. It uses a local rose logo, original floral line artwork, Inter SemiBold, and the supplied palette. Artwork sources are in `assets/artwork/`; the app uses PNG exports for predictable native rendering. No network access, API keys, authentication, or database is needed by these screens.

The OS launch screen uses the purple logo on white. Once the bundled font is ready, the app displays the full floral design. A system font fallback allows launch if the font cannot load. The operating system controls its launch screen presentation; verify this in a release build, as Expo Go and development builds do not fully reproduce it.

The splash is approved. On normal launch, its first layout starts a 1.5-second display period, then Expo Router replaces it with `/welcome`; going back does not reopen the splash. The timeout is cleared if the splash unmounts. The root layout loads Inter Regular and SemiBold for both routes and also releases the native launch screen when `/welcome` is opened directly.

The approved welcome screen uses two bundled flower portraits, the supplied colors, rounded hashtag labels, and the approved copy: “Fresh flowers for every occasion, delivered with care to your doorstep.” It supports scrolling on small displays and with enlarged text. Sources for the photos are in `assets/artwork/README.md`.

“Let’s Get Started” opens `/onboarding`. “Sign In” still shows an explicit “available soon” message; no Clerk session or API is simulated. A fresh launch shows splash → welcome each time, with no persisted onboarding state.

**Review checkpoint:** `/onboarding` is the first slide, titled “Craft Your Ultimate Floral Collection.” It has the first of three progress dots active, decorative wishlist phone artwork, and the approved description: “Save your favorite flowers and bouquets, and keep every beautiful find in one place.” The phone's products, prices, ratings, hearts, and tabs are illustrative sample content, not a working wishlist or backend data.

Back dismisses to welcome, including when the slide is opened directly. Skip and Next share the same pending action and currently show “The next step will be available soon.” Their destination will be connected when the next supplied screen is implemented. No later slides or onboarding-completion state are implemented.

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
npx expo-doctor
npm run export:native
```

For browser-based visual inspection only, run `npm run preview:ui`. React DOM and React Native Web are development dependencies; the app's configured shipping platforms remain iOS and Android. A browser preview cannot verify the native OS splash, system bars, or physical-device behavior.

## Upcoming services

Clerk authentication and a secure server API backed by Neon PostgreSQL will be connected when their screens are defined. Keep Neon credentials and Clerk secret keys exclusively on the backend. Never connect this app directly to Neon. `.env.example` documents the boundary; there are no mock API calls in the current screen.

## Verification limits

TypeScript, lint, Expo Doctor (21 checks), and Metro exports for iOS and Android pass. The browser preview was inspected at 320×568, 393×852, and 768×1024. Native device startup and the OS launch screen still need verification on an Android device/emulator and an iOS device/simulator; this Linux sandbox has neither available.

The initial dependency audit reports 29 advisories (18 high, 11 moderate) inherited through the Expo/React Native dependency tree, including braces, node-forge, decode-uri-component, and uuid. These remain unresolved; npm's proposed fixes include incompatible SDK downgrades. Recheck compatible upstream fixes before release.
