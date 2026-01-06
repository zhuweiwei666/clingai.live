# Parity Verification Guide

This document describes how to verify 1:1 parity with the benchmark site.

## Manual Verification Checklist

### Frontend Pages

- [ ] Home page (`/`) - Templates grid, header, bottom nav
- [ ] Create page (`/create`) - Template selection and upload flow
- [ ] Face Swap (`/face-swap`) - Image/Video/Dress Up tabs
- [ ] Chat Edit (`/chat-edit`) - Photo upload and text input
- [ ] AI Image (`/ai-image`) - Style selection and generation
- [ ] Dress Up (`/dress-up`) - Clothing template selection
- [ ] Remove (`/remove`) - Background/watermark removal
- [ ] HD Upscale (`/hd`) - Image upscaling
- [ ] Profile (`/profile` or `/my`) - User info, plan, coins, works
- [ ] My Works (`/my-works` or `/history`) - Works gallery with filters
- [ ] Coins (`/coins` or `/pricing`) - Coin packages and purchase
- [ ] Subscribe (`/subscribe`) - Subscription plans
- [ ] Payment History (`/paylist`) - Order history
- [ ] Settings (`/settings` or `/setting`) - User settings
- [ ] Result (`/result`) - Task result display

### Route Aliases

- [ ] `/makeover` → `/face-swap`
- [ ] `/history` → `/my-works`
- [ ] `/setting` → `/settings`
- [ ] `/pricing` → `/coins`
- [ ] `/subscribeSuper` → `/subscribe`
- [ ] `/tools` → `/create`
- [ ] `/generate` → `/create`
- [ ] `/face` → `/face-swap`
- [ ] `/takeoff` → `/remove`

### Backend APIs

- [ ] `/api/settings/get` - Returns global settings
- [ ] `/api/order/packages` - Returns coin packages
- [ ] `/api/order/plans` - Returns subscription plans
- [ ] `/api/order/my_subscribe` - Returns user subscription info
- [ ] `/api/user/profile` - Returns user profile
- [ ] `/api/user/works` - Returns user works
- [ ] `/api/user/orders` - Returns payment history
- [ ] `/api/generate/*` - All generation endpoints return `{ success, data }`
- [ ] `/api/generate/task/:id` - Task status polling
- [ ] All error responses follow `{ success: false, error, code }` format

### Payment Flows

- [ ] Coin purchase flow (Stripe)
- [ ] Coin purchase flow (PayPal)
- [ ] Subscription purchase flow (Stripe)
- [ ] Subscription purchase flow (PayPal)
- [ ] Webhook processing updates user coins/plan correctly
- [ ] Payment history displays correctly

### Admin Console

- [ ] Dashboard displays metrics and charts
- [ ] Users page - search, filter, ban, coin adjustment
- [ ] Tasks page - monitor, retry, cancel
- [ ] Orders page - view, refund
- [ ] Settings page - configure packages, costs, system settings

## Automated Verification

### E2E Tests

Run Playwright E2E tests:
```bash
npm run test:e2e
```

### Visual Regression

Compare visual appearance:
```bash
npm run test:e2e:update  # Update baselines
npm run test:e2e         # Run comparison
```

### API Contract Tests

Verify API response formats:
```bash
npm run test:e2e -- tests/api-contract.spec.js
```

## Deployment Verification

After deployment, verify:

1. **Frontend**
   - [ ] All pages load correctly
   - [ ] Assets load from R2/CDN
   - [ ] Navigation works
   - [ ] Forms submit correctly

2. **Backend**
   - [ ] API endpoints respond correctly
   - [ ] Database connections work
   - [ ] Queue processing works
   - [ ] A2E API integration works

3. **Admin**
   - [ ] Admin login works
   - [ ] All admin pages load
   - [ ] Admin actions work (ban user, adjust coins, etc.)

4. **Payments**
   - [ ] Stripe webhook receives events
   - [ ] PayPal webhook receives events
   - [ ] Coins/plans update correctly after payment

5. **Nginx**
   - [ ] Frontend served at `/`
   - [ ] Admin served at `/admin/`
   - [ ] API proxied at `/api/*`

## Performance Checks

- [ ] Page load times < 3s
- [ ] API response times < 500ms
- [ ] Image/video assets load efficiently
- [ ] No console errors
- [ ] No network errors

## Browser Compatibility

Test on:
- [ ] Chrome (Desktop)
- [ ] Firefox (Desktop)
- [ ] Safari (Desktop)
- [ ] Chrome (Mobile)
- [ ] Safari (Mobile)

