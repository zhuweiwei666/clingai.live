# OnlyCrush 1:1 Parity — API Contract Matrix

Benchmark base (observed): requests go to `https://onlycrush.app/app/*`.

Our base: `POST/GET /api/*` (Express). This document maps benchmark endpoints to our equivalents and tracks gaps.

## Bootstrap sequence (observed on initial page load `/`)

On first load of `https://h5.onlycrush.app/` (logged-out), the app performs these XHR calls (order observed):

1. `POST https://onlycrush.app/app/get_ad`
2. `GET  https://onlycrush.app/app/user/info?pixelId=1950529715523812&fbp=<fbp>&fbc=null&adsourceid=null`
3. `GET  https://onlycrush.app/app/order/my_subscribe`
4. `GET  https://onlycrush.app/app/settings/get`
5. `GET  https://onlycrush.app/app/tools/get`

Notes:
- All of the above also perform `OPTIONS` preflight.
- `user/info` includes marketing identifiers via querystring (pixelId/fbp/fbc/adsourceid).
- Media assets are loaded from `https://img-pub.onlycrush.app/...` (images + mp4).

## Auth

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/auth/get_google_url` | Google OAuth URL | N/A (we use Google OAuth client-side) | unknown |
| `/app/auth/firebase_login` | Firebase login | N/A | missing |
| `/app/auth/email_login` | Email login | `/api/auth/login` | partial |
| `/app/auth/send_email_code` | Email OTP | `/api/auth/send-code` (if exists) | unknown |
| `/app/auth/discord_url` | Discord OAuth | N/A | missing |
| `/app/auth/logout` | Logout | `/api/auth/logout` | unknown |
| `/app/token` (route) | token/callback handling | N/A | missing |

## User / Profile

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/user/info` | Bootstrap user session, plan, coins (observed on initial load) | `/api/user/profile` (or `/api/user/me`) | partial |
| `/app/user/payment_history` | Payment history list (observed on `/paylist`, method `POST`) | `/api/user/orders` | missing |
| `/app/user/feedback` | Feedback submit (invoked from `/feedback` via `Send`) | N/A | missing |
| `/app/user/email` | Email retrieval | N/A | missing |
| `/app/user/save_email` | Save email | N/A | missing |
| `/app/user/destory` | Delete account | `/api/user/delete` (if exists) | missing |
| `/app/guest/bind` | Bind guest to account | N/A | missing |
| `/app/guest/get_task` | Guest task polling | N/A | missing |

## Settings / Config

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/settings/get` | Global settings bootstrap (observed on initial load) | `/api/settings` (missing) | missing |
| `/app/tools/config` | Tools config | `/api/templates/categories` + settings (partial) | partial |
| `/app/change_clothes_tips` | Dress-up tips (observed on `/takeoff`) | N/A | missing |
| `/app/tools/change_clothes_setting` | Dress-up templates/settings (observed on `/my`) | `/api/templates?category=dressup` (needs parity) | partial |
| `/app/tools/get_by_file_type` | Filter by file type (observed) | `/api/templates` / `/api/works` | partial |

## Tools / Templates

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/tools/get` | Tools list (observed on initial load) | `/api/templates` | partial |
| `/app/tools/get_by_file_type` | Fetch templates filtered by file type (observed on `/makeover?type=change_face_image`) | `/api/templates` + filters | partial |
| `/app/tools/change_clothes_setting?page=1&size=99` | Dress-up settings/templates (observed on `/makeover?type=change_face_image`) | `/api/templates?category=dressup` + settings | partial |
| `/app/tools/like` | Like a tool/template | N/A | missing |
| `/app/ad/get_files` | Ad assets | N/A | missing |
| `/app/get_ad` | Ad config (observed) | N/A | missing |

## Generation / Tasks (Undress + Makeover)

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/photos` | Upload/create photo records (observed) | `/api/upload` + `/api/works` | partial |
| `/app/file/upload` | Upload file | `/api/upload` | partial |
| `/app/upload` | Upload | `/api/upload` | partial |
| `/app/tools/undress/get` | List works/tasks for “undress” (observed on `/my`) | `/api/works` | partial |
| `/app/tools/undress/create` | Create undress task | `/api/generate/remove` (needs parity) | partial |
| `/app/tools/undress/get_task` | Task polling | `/api/generate/task/:id` | partial |
| `/app/tools/undress/retry` | Retry task | N/A | missing |
| `/app/tools/undress/delete` | Delete work | `/api/works/:id` (if exists) | partial |
| `/app/tools/undress/read` | Mark as read | N/A | missing |
| `/app/tools/undress/image_hd` | HD enhancement | `/api/generate/hd` | partial |
| `/app/tools/undress/task_price` | Price/coins for task | `/api/templates` + settings | missing |

## Orders / Payments

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/order/my_subscribe` | Current subscription (observed on initial load) | `/api/order/plans` + user plan | partial |
| `/app/get_coins_prices` | Coin packs (observed on `/coins`) | `/api/order/packages` | partial |
| `/app/coins_price` | Coin price (observed on `/subscribe`) | `/api/order/packages` | partial |
| `/app/get_vip_price` | VIP price (observed on `/subscribe`) | `/api/order/plans` | partial |
| `/app/order/paypal_buy_coins` | PayPal coins order | `/api/order/create` + `/api/order/paypal/capture` | partial |
| `/app/order/paypal_subscribe_vip` | PayPal subscribe | `/api/order/create` + webhook | partial |
| `/app/order/stripe_buy_coins` | Stripe coins | `/api/order/create` + webhook | partial |
| `/app/order/stripe_subscribe_vip` | Stripe subscribe | `/api/order/create` + webhook | partial |
| `/app/order/stripe_unsubscribe` | Stripe unsubscribe | N/A | missing |
| `/app/order/stripe_order_info` | Stripe order info | `/api/order/:orderId` (needs parity) | partial |
| `/app/stripe/create_setup_intent` | Stripe setup intent | N/A | missing |
| `/app/stripe/create_direct_subscription` | Direct subscription | N/A | missing |
| `/app/stripe/create_payment_and_confirm` | Payment confirm | N/A | missing |

## Agents / Community

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/agent/list` | Agent list (observed on `/my`) | N/A | missing |
| `/app/agent/info` | Agent detail | N/A | missing |
| `/app/agent/photos` | Agent photos | N/A | missing |

## Reporting

| Benchmark | Purpose | Our Equivalent | Parity Status |
|---|---|---|---|
| `/app/report` | Report content | N/A | missing |
| `/app/access` | Access gating | N/A | missing |
| `/app/email/unsubscribe` | Email unsubscribe | N/A | missing |


