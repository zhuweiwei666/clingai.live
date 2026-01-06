# OnlyCrush 1:1 Parity — Analytics / Events

Goal: replicate event **names**, **trigger timing**, and **payload fields** so dashboards and ad attribution match benchmark behavior.

## Events observed (initial)

| Event | Trigger | Notes |
|---|---|---|
| `SubscribedButtonClick` | Click subscribe CTA / upgrade prompts | Observed as Facebook Pixel event with rich `buttonFeatures` payload |

## Trackers present (benchmark)

- Google Analytics (`gtag`) with multiple measurement IDs\n+- Facebook Pixel\n+- Microsoft Clarity\n+
## Next capture steps

1. Traverse purchase funnels (`/coins`, `/subscribe`, `/subscribeSuper`, `/paylist`) and record event sequences.\n+2. Capture `localStorage` keys and auth/session bootstrap sequence.\n+3. Define our unified `track()` wrapper (frontend) and ensure parity-gates validate emitted events.\n+

