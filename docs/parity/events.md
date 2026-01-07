# OnlyCrush 1:1 Parity — Analytics / Events

Goal: replicate event **names**, **trigger timing**, and **payload fields** so dashboards and ad attribution match benchmark behavior.

## Events observed (initial)

| Event | Trigger | Notes |
|---|---|---|
| `SubscribedButtonClick` | Click subscribe CTA / upgrade prompts | Observed as Facebook Pixel event with rich `buttonFeatures` payload |

Observed request shape (example):
- `GET https://www.facebook.com/tr/?id=<pixelId>&ev=SubscribedButtonClick&...&cd[buttonFeatures]=...&cd[pageFeatures]={title:...}`

## Trackers present (observed on `/`)

- Google Analytics (`gtag`)
  - `G-9C8QENRPRK`
  - `G-TVFRYH2EWG`
  - `G-QXL62X07TV`
- Facebook Pixel
  - Pixel ID `1620146075297767`
  - Pixel ID `1950529715523812`
  - Emits `PageView` on load (observed via `/tr` request)
- Microsoft Clarity
  - Tag ID `ro0g3cnoh8`
- Cloudflare Turnstile
  - Loads `https://challenges.cloudflare.com/turnstile/.../api.js`
- Cloudflare Insights beacon
  - Loads `https://static.cloudflareinsights.com/beacon.min.js/...`
- PayPal SDK (attempted)
  - Loads `https://www.paypal.com/sdk/js?...&components=applepay` (observed 400 in our run; still indicates integration)

## Next capture steps

1. Traverse purchase funnels (`/coins`, `/subscribe`, `/subscribeSuper`, `/paylist`) and record event sequences.
2. Capture `localStorage` keys and auth/session bootstrap sequence.
3. Define our unified `track()` wrapper (frontend) and ensure parity-gates validate emitted events.

