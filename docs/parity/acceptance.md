# Parity Acceptance Checklist (Per Route)

This document is the **route-by-route acceptance gate** for the OnlyCrush 1:1 rebuild.

Rules:
- A route is not considered “done” until **UI + states + network calls + key events** match the benchmark.
- Every checklist item below must be verifiable via Playwright (visual and/or network assertions).

## `/` (Home)

- UI
  - Header shows `HOT AI` logo; right side has `Pro` pill + action icons.
  - Feature icon tabs row: Remove, Chat Edit, AI Image, AI Video (Super), Face Swap (Super), Dress Up (Super), Enhance...
  - Section header: `Trending: Photo to video` with `See All` link.
  - Two-column card grid with rounded corners, heavy overlay text, and `New` / `Super` badges.
- Network
  - Calls on load:
    - `POST https://onlycrush.app/app/get_ad`
    - `GET  https://onlycrush.app/app/user/info?...`
    - `GET  https://onlycrush.app/app/order/my_subscribe`
    - `GET  https://onlycrush.app/app/settings/get`
    - `GET  https://onlycrush.app/app/tools/get`
- Events
  - Facebook Pixel: `PageView` fires on load (pixel IDs: `1620146075297767`, `1950529715523812`).

## `/makeover?type=change_face_image` (Face Swap Hub)

- UI
  - Top segmented tabs: `Image Face Swap` (active), `Video Face Swap`, `Dress Up`.
  - Large CTA: `Custom Image Face Swap`.
  - Two-column template grid; some items show `Super` badge.
- Network
  - Standard bootstrap calls (same as `/`), plus:
    - `POST https://onlycrush.app/app/photos`
    - `POST https://onlycrush.app/app/tools/get_by_file_type`
    - `GET  https://onlycrush.app/app/tools/change_clothes_setting?page=1&size=99`

## `/coins` (Buy Coins)

- UI
  - Close `X` top-left, title `Buy Coins`.
  - 3x2 coin packages grid with purple `+X Coins` bonus pills.
  - Primary CTA: wide purple pill labeled `stripe`.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/get_coins_prices`

## `/subscribe` (Pro+ Subscribe)

- UI
  - Close `X` top-left.
  - Background video loaded from `/assets/login-*.mp4`.
  - Title `Hot AI Pro+`, feature bullet list.
  - Segmented CTA: `SUBSCRIBE` + `COINS`.
  - Pricing cards:
    - `SUPER` yearly: `$59.99 per year`, `$1.15 per week`
    - `MONTHLY ACCESS`: `just $19.99 per month`, `$0.60 per day`
  - Primary CTA: wide gradient `stripe` button.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/get_vip_price`
    - `GET https://onlycrush.app/app/coins_price`

## `/subscribeSuper` (Super Upsell)

- UI
  - Full-screen red/pink gradient.
  - Header `HotAI Super` + close `X`.
  - `Exclusive Annual Fantasy` copy and a single yearly pricing card.
  - Primary CTA `stripe` inside the pricing card.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/get_vip_price`

## `/paylist` (Payment History)

- UI
  - Header `Order Information` + back arrow.
  - Empty state: `No Order Information`.
- Network
  - Standard bootstrap calls, plus:
    - `POST https://onlycrush.app/app/user/payment_history`

## `/my` (Profile)

- UI
  - Header `HOT AI` logo; `Pro` pill + action icons.
  - Plan card: `Free` and purple `Subscribe` CTA.
  - Two-card grid: work preview + Discord community card (`Join Us Now`).
  - Bottom nav appears as 4 icons (incl. one with `Super` badge).
- Network
  - Standard bootstrap calls, plus:
    - `POST https://onlycrush.app/app/agent/list`
    - `POST https://onlycrush.app/app/tools/undress/get`

## `/create` (Create / Upload Her Image)

- UI
  - Back arrow top-left; `Pro` pill top-right.
  - Two-image “before/after” preview with curved swap arrow.
  - Primary CTA: `Upload Her Image` pill button with `+`.
  - Bottom rounded drawer: `More ways to play with her` with a two-column grid.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/tools/get`

## `/history` (History / Works)

- UI
  - Shows work preview content (and may share the “profile/community” two-card layout when logged out).
- Network
  - Standard bootstrap calls, plus:
    - `POST https://onlycrush.app/app/tools/undress/get`
    - `POST https://onlycrush.app/app/agent/list`

## `/setting` (Settings)

- UI
  - Header `Settings` with back arrow.
  - Plan card `Free` + purple `Subscribe` CTA.
  - Personalization list: `Language`, `Join and get realtime support`, `Feedback`, `About`, `Membership`, `Open Fast`.
  - General settings: `Account Deletion`.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/order/my_subscribe`

## `/feedback` (Feedback)

- UI
  - Header `Feedback` with back arrow and purple `Send` pill button.
  - Email field placeholder: `Leave an email to receive reply`.
  - Feedback textarea placeholder: `Enter your feedbacks here`.
  - A support list item: `Join and get realtime support` (Discord icon).
- Network
  - Standard bootstrap calls on load.
  - When pressing `Send`, app should invoke:
    - `POST https://onlycrush.app/app/user/feedback`

## `/takeoff` (Custom Outfit)

- UI
  - Header `Custom Outfit` with back arrow.
  - Copy: `Upload source image with a face` and helper `Please upload HD front-face photo.`
  - CTA: `Upload Photos` (purple).
  - Textarea placeholder: `Enter your desired effect...`
  - Bottom `Generate` purple bar with a coin indicator on the right.
- Network
  - Standard bootstrap calls, plus:
    - `GET https://onlycrush.app/app/change_clothes_tips`
    - `POST https://onlycrush.app/app/photos`


