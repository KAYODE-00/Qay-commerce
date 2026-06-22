# QAY Commerce Platform Strategy

QAY should treat Medusa as the commerce engine and keep QAY responsible for site ownership, editor state, deployment, tenant rules, and merchant onboarding.

## Current Backend Capability

The Medusa backend can provide:

- products, variants, categories, collections
- carts and checkout
- orders and customers
- regions and currencies
- sales channels
- publishable API keys
- admin dashboard
- payment provider integration
- event subscribers for webhook sync

The QAY editor can build storefront UI on top of the Medusa Store API. The minimum connection values per QAY site are:

```env
MEDUSA_BACKEND_URL=
NEXT_PUBLIC_MEDUSA_BACKEND_URL=
MEDUSA_PUBLISHABLE_KEY=
```

Later, store these optional values per QAY site:

```env
MEDUSA_REGION_ID=
MEDUSA_SALES_CHANNEL_ID=
```

## Multi-Store Strategy

Do not use one global publishable key for every serious merchant.

Recommended model:

- one Medusa backend for the platform at first
- one sales channel per QAY ecommerce site
- one publishable API key per QAY ecommerce site
- products are assigned to the site's sales channel
- QAY stores the site's backend URL, publishable key, region ID, and sales channel ID

This gives each generated storefront a scoped Store API identity. Medusa automatically infers the sales channel from the publishable key when Store API requests include `x-publishable-api-key`.

Move to one Medusa instance per merchant only when you need hard data isolation, enterprise contracts, or merchant-owned infrastructure.

## Payment Strategy

Stripe is now configured in `medusa-config.ts` when `STRIPE_API_KEY` exists.

Required Stripe envs:

```env
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_CAPTURE=false
STRIPE_AUTOMATIC_PAYMENT_METHODS=false
```

After adding keys:

1. Restart Medusa.
2. Open Medusa Admin.
3. Go to the region used by the storefront.
4. Enable the Stripe payment provider, such as `pp_stripe_stripe`.
5. For production, configure Stripe webhook endpoint:

```text
{MEDUSA_BACKEND_URL}/hooks/payment/stripe_stripe
```

For a Shopify-like platform, QAY should eventually use Stripe Connect so each merchant can connect their own Stripe account. The current single `STRIPE_API_KEY` model is best for one platform account or early controlled rollout.

## QAY Webhooks

This backend can notify QAY through:

```env
QAY_WEBHOOK_URL=
QAY_WEBHOOK_SECRET=
```

Implemented subscriber events:

- `order.placed`
- `payment.captured`
- `product.updated`
- `customer.created`

Payloads include the event name, event data, and emitted timestamp. If `QAY_WEBHOOK_SECRET` is set, requests include `x-qay-signature`, an HMAC SHA-256 signature of the JSON body.

QAY should verify the signature, deduplicate events, then fetch fresh entity details from Medusa instead of trusting webhook payloads as the final source of truth.

## Security Boundaries

Browser-safe:

- Medusa backend URL
- publishable API key
- region ID
- sales channel ID

Never expose in browser:

- Admin API token
- Stripe secret key
- Stripe webhook secret
- Medusa JWT secret
- Medusa cookie secret
- database URL

Admin-only commerce operations must go through QAY's backend, not directly from user-created storefront pages.

## What Is Still Needed For Shopify-Level Power

- merchant onboarding UI in QAY
- per-site sales channel and publishable key creation automation
- Stripe Connect or merchant payment configuration
- production Redis
- production deployment with backups and monitoring
- webhooks from Medusa to QAY
- QAY-side order/product cache invalidation
- tenant permission checks
- rate limits and abuse protection
- staged environments for development, staging, and production
