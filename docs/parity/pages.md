# OnlyCrush 1:1 Parity — Pages / Routes Matrix

This document is the source-of-truth checklist for **pixel-perfect UI/UX** and **strict functional parity**.

## Primary routes (discovered)

| Benchmark Route | Purpose (observed) | Our Route (current) | Parity Status |
|---|---|---|---|
| `/` | Home feed (templates grid + trending) | `/` | partial |
| `/makeover?type=change_face_image` | Face Swap hub (tabs: Image Face Swap / Video Face Swap / Dress Up) + “Custom Image Face Swap” CTA | `/face-swap` + `/dress-up` (separate) | missing route parity |
| `/makeover?type=change_face_video` | Video face swap mode | `/face-swap` (tab) | partial |
| `/makeover?type=dress_up` | Dress up mode | `/dress-up` | partial |
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

