# OnlyCrush 1:1 Parity — Pages / Routes Matrix

This document is the source-of-truth checklist for **pixel-perfect UI/UX** and **strict functional parity**.

## Primary routes (discovered)

| Benchmark Route | Purpose (observed) | Our Route (current) | Parity Status |
|---|---|---|---|
| `/` | Home feed (templates grid + trending) | `/` | partial |
| `/makeover?type=change_face_image` | Face Swap hub (tabs: Image Face Swap / Video Face Swap / Dress Up) + “Custom Image Face Swap” CTA | `/face-swap` + `/dress-up` (separate) | missing route parity |
| `/makeover?type=change_face_video` | Video face swap mode | `/face-swap` (tab) | partial |
| `/makeover?type=dress_up` | Dress up mode | `/dress-up` | partial |

Notes observed on `/makeover?type=change_face_image`:
- Top segmented tabs: `Image Face Swap` (active), `Video Face Swap`, `Dress Up`
- A large CTA button: `Custom Image Face Swap`
- Two-column grid of templates (some tagged `Super`)
- Network calls include: `POST /app/get_ad`, `GET /app/order/my_subscribe`, `GET /app/settings/get`, `GET /app/user/info`, plus `POST /app/photos`, `GET /app/tools/get_by_file_type`, `GET /app/tools/change_clothes_setting?page=1&size=99`

Notes observed on `/coins`:
- Modal-style page with an `X` close button (top-left)
- Title: `Buy Coins`
- 3x2 grid of coin packages with purple `+X Coins` bonus pills
- Primary CTA: a wide purple pill button labeled `stripe`
- Network call: `GET /app/get_coins_prices` (plus standard bootstrap calls)

Notes observed on `/subscribe`:
- Close `X` (top-left)
- Background video asset (observed: `/assets/login-*.mp4`)
- Title: `Hot AI Pro+`
- Feature list with checkmarks (e.g. `Unlock HD Export`, `Remove Watermark`, etc.)
- Two-button segmented CTA: `SUBSCRIBE` and `COINS`
- Two pricing cards:
  - `SUPER` (Yearly access, $59.99 per year, $1.15 per week)
  - `MONTHLY ACCESS` (just $19.99 per month, $0.60 per day)
- Primary payment CTA: wide gradient button labeled `stripe`
- Network calls include: `GET /app/get_vip_price`, `GET /app/coins_price`, `GET /app/order/my_subscribe` (plus standard bootstrap)

Notes observed on `/subscribeSuper`:
- Full-screen red/pink gradient upsell page
- Header: `HotAI Super` + close `X`
- Title: `Exclusive Annual Fantasy`
- Subtitle: `Access all templates, including exclusive 18+ premium ones!`
- Pricing card: `Just $59.99 per year`, `$1.15/per week`
- Primary payment CTA: `stripe` (gradient pill inside the card)
- Network calls include: `GET /app/get_vip_price`, `GET /app/order/my_subscribe` (plus standard bootstrap)

Notes observed on `/paylist`:
- Header: `Order Information` with a back arrow (top-left)
- Empty state text: `No Order Information`
- Network call: `POST /app/user/payment_history` (plus standard bootstrap)

Notes observed on `/my`:
- Header with `HOT AI` logo (top-left) and action icons (incl. `Pro` pill button)
- Plan card: `Free` with a purple `Subscribe` CTA
- Two-card grid:
  - Left: latest/featured work preview card (image/video) with a small arrow button
  - Right: community card `Join Us Now` (Discord icon) + `Create templates with me`
- Bottom navigation appears as 4 icons (observed): tools, wallet, a `Super`-tagged icon, and a clipboard-like icon
- Network calls include: `POST /app/agent/list` and `POST /app/tools/undress/get` (plus standard bootstrap)

Notes observed on `/create`:
- Back arrow top-left, `Pro` pill top-right
- Center “before/after” preview (two tilted images) with a small curved arrow between
- Primary CTA: `Upload Her Image` (pill button) with a `+`
- Below: a rounded “drawer” section titled `More ways to play with her` showing a two-column template grid
- Network calls include: `GET /app/user/info?...` and `GET /app/tools/get` (plus standard bootstrap)

Notes observed on `/history`:
- Appears to share the same “profile/community” card layout (work preview + `Join Us Now` card) in the logged-out state
- Network calls include: `POST /app/tools/undress/get` and `POST /app/agent/list` (plus standard bootstrap)

Notes observed on `/setting`:
- Header: `Settings` with back arrow
- Plan card: `Free` with purple `Subscribe` CTA
- Section `Personalization` list items:
  - `Language`
  - `Join and get realtime support`
  - `Feedback`
  - `About`
  - `Membership`
  - `Open Fast`
- Section `General settings`:
  - `Account Deletion`
- Network call observed: `GET /app/order/my_subscribe` (plus standard bootstrap)

Notes observed on `/feedback`:
- Header: `Feedback` with back arrow and a purple `Send` pill button (top-right)
- Field: `Leave an email to receive reply`
- Field: `Enter your feedbacks here` (large textarea)
- Footer-ish list item: `Join and get realtime support` (Discord icon)
- Network call on page load: no dedicated feedback endpoint observed until `Send` is pressed (bootstrap only)

Notes observed on `/remove`:
- Navigating directly to `/remove` currently shows a React Router error boundary: `Unexpected Application Error! 404 Not Found`
- This suggests the real route for this feature is **not** `/remove` (see `/takeoff`)

Notes observed on `/takeoff`:
- Header: `Custom Outfit` with back arrow
- Left: dashed upload placeholder; copy: `Upload source image with a face` + helper text `Please upload HD front-face photo.`
- CTA: `Upload Photos` (purple)
- Large textarea placeholder: `Enter your desired effect...`
- Bottom: wide purple `Generate` bar with a small coin indicator on the right
- Network calls include: `GET /app/change_clothes_tips` and `POST /app/photos` (plus standard bootstrap)
| `/my` | Profile/My area: plan badge, subscribe CTA, cards (community/agents), works list | `/profile` | missing route parity |

## Secondary routes (extracted from benchmark bundle)

| Benchmark Route | Notes (initial) | Our Route (current) | Parity Status |
|---|---|---|---|
| `/login` | Login entry | `/login` | partial |
| `/login?type=1` | Alternate login variant | N/A | missing |
| `/profile` | Profile (may deep link) | `/profile` | partial |
| `/setting` | Settings page | `/settings` | missing route parity |
| `/create` | Create/generate flow | `/create` | partial |
| `/result` | Result page after generation | N/A | missing |
| `/history` | History/works | `/my-works` | missing route parity |
| `/coins` | Coins purchase / wallet | `/pricing` | missing route parity |
| `/paylist` | Payment history | N/A | missing |
| `/subscribe` | Subscribe flow | `/pricing` | missing route parity |
| `/subscribeSuper` | Super subscription flow | N/A | missing |
| `/subscribeSuper?from=result` | Upsell from result | N/A | missing |
| `/oncesubscribe` | One-time subscribe (?) | N/A | missing |
| `/unsubscribe` | Unsubscribe flow | N/A | missing |
| `/token` | Token page (auth callback?) | N/A | missing |
| `/tools` | Tools landing | N/A | missing |
| `/generate` | Generate routing helper | N/A | missing |
| `/makeovergen` | Makeover generate helper | N/A | missing |
| `/face` | Possibly face feature landing | N/A | missing |
| `/takeoff` | “Undress” feature landing | N/A | missing |
| `/quiz` | Quiz onboarding | N/A | missing |
| `/feedback` | Feedback form | N/A | missing |
| `/vibe` | Unknown feature section | N/A | missing |
| `/pwa` | PWA guide/landing | N/A | missing |
| `/access` | Access gating page | N/A | missing |

## Next steps for parity

1. For each route above, we will capture:\n+   - exact UI structure, typography, spacing, and states\n+   - all network calls triggered (request/response shapes)\n+   - button enable/disable rules and error handling\n+2. Then implement route aliases in our app so URLs match the benchmark.\n+
## Bootstrap calls observed on `/`

On initial load of `https://h5.onlycrush.app/`, the page performs a settings/session bootstrap and loads trackers:

- API calls (XHR):
  - `POST https://onlycrush.app/app/get_ad`
  - `GET  https://onlycrush.app/app/user/info?...`
  - `GET  https://onlycrush.app/app/order/my_subscribe`
  - `GET  https://onlycrush.app/app/settings/get`
  - `GET  https://onlycrush.app/app/tools/get`
- Trackers:
  - GA (`gtag`) + Facebook Pixel + Clarity + Cloudflare Insights + Turnstile
- Assets:
  - UI bundle from `https://h5.onlycrush.app/assets/*`
  - Media (images/videos) from `https://img-pub.onlycrush.app/*`

