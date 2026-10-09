# Brand artwork

The rose logo and floral branch SVGs are original artwork created for this app, inspired by the supplied visual reference. They do not copy the reference's source photographs or logo files. Colors use the supplied primary purple and a pale neutral for the floral lines.

`../images/flower-logo.png` is a 432 px transparent export of the logo. `floral-branch.png` is an 840 px transparent export of the branch. The 1024 px app and adaptive icons place the logo on white. Keep exported assets synchronized when editing the SVG sources.

Typography: Inter by Rasmus Andersson, bundled locally through `@expo-google-fonts/inter` under the SIL Open Font License (included in that package).

## Welcome imagery

Local JPEGs are resized copies of Pexels photographs, used as similar assets for the approved welcome reference:

- `../images/welcome-fresh.jpg`: [Pexels photo 22638496](https://www.pexels.com/photo/22638496/) — source `https://images.pexels.com/photos/22638496/pexels-photo-22638496.jpeg?w=720`.
- `../images/welcome-flowers.jpg`: [Pexels photo 13869766](https://www.pexels.com/photo/13869766/) — source `https://images.pexels.com/photos/13869766/pexels-photo-13869766.jpeg?w=900`.
- [Pexels license](https://www.pexels.com/license/).

`welcome-flourish.svg` is original decorative spiral artwork; `../images/welcome-flourish.png` is its 3× export. The screen renders rounded photo crops and hashtag badges in React Native. All artwork is bundled for offline use.

## Onboarding artwork

`wishlist-preview.svg` is original decorative vector artwork: a phone frame containing a fictional wishlist and sample bouquets, prices, ratings, category chips, and favorite icons. These are part of the illustration and have no product interactions or backend connection. `../images/wishlist-preview.png` is the 900×1770 export, rendered with the project's bundled Inter fonts. No new photo or image-generation service was used for this artwork.

`onboarding-curve.svg` and its 3× PNG export form the curved white section boundary. All images are bundled locally. The slide's actual Skip/Back/Next controls and accessible progress indicator are React Native components, separate from the decorative phone.

## Shopping onboarding artwork

`shopping-preview.svg` and its 900×1770 PNG export reuse the original phone frame and bouquet symbols from `wishlist-preview.svg`. The illustration adds a purple shop header, search field, fictional special offer, category chips, and sample recommendations. These controls and offers are decorative, not interactive or real promotions.

The offer banner embeds the existing Pexels photo 22638496 (`welcome-fresh.jpg`), with the source and license listed above. The SVG embeds it so the source remains portable; the app uses only the raster export. Inter is rendered using the existing bundled font files. No new downloads, runtime dependencies, or image-generation service were required.
