# QAY Commerce Medusa Setup

This repo is the Medusa DTC Starter foundation for QAY commerce integrations. QAY should store a per-site commerce connection with:

- Medusa backend URL
- Medusa publishable API key
- optional region ID
- optional sales channel ID

## Local Prerequisites

- Node.js 20 LTS is recommended. This machine is currently on Node `v24.14.0`; Medusa declares `>=20`, but use Node 20 LTS if CLI/runtime issues appear.
- pnpm 10.11.1
- PostgreSQL 15+
- Redis is recommended for production. Local development can start without Redis only if your Medusa setup does not require background/event features.

Docker is not installed on this machine, and no local PostgreSQL/Redis process was detected during setup.

## Install

```bash
git clone https://github.com/medusajs/dtc-starter.git
cd dtc-starter
pnpm install --frozen-lockfile
```

On Windows PowerShell, use `cmd /c pnpm ...` if script execution blocks `pnpm.ps1`.

## Backend Environment

Copy the backend template:

```bash
cp apps/backend/.env.template apps/backend/.env
```

Required backend variables:

- `DATABASE_URL`: PostgreSQL connection string, for example `postgres://postgres:postgres@localhost:5432/medusa-dtc-starter`.
- `REDIS_URL`: recommended for production, for example `redis://localhost:6379`.
- `JWT_SECRET`: unique long secret per environment.
- `COOKIE_SECRET`: unique long secret per environment.
- `STORE_CORS`: include storefront and QAY origins. Local template allows `http://localhost:8000`, `http://localhost:3000`, `http://localhost:3002`, and `https://qay-theta.vercel.app`.
- `ADMIN_CORS`: include Medusa Admin origins, usually `http://localhost:9000` and `http://localhost:5173`.
- `AUTH_CORS`: include admin, storefront, and QAY origins that use auth.
- `MEDUSA_BACKEND_URL`: public backend URL, local default `http://localhost:9000`.
- `STOREFRONT_URL`: local default `http://localhost:8000`.

Stripe variables are present in the template as placeholders only:

- `STRIPE_API_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CAPTURE`

The current backend does not register Stripe by default. Do not use live keys. Add and configure `@medusajs/payment-stripe` before expecting Stripe checkout.

## Storefront Environment

Copy the storefront template:

```bash
cp apps/storefront/.env.template apps/storefront/.env.local
```

Required storefront variables:

- `NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000`
- `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=<token from Medusa Admin>`
- `NEXT_PUBLIC_DEFAULT_REGION=dk`
- `NEXT_PUBLIC_BASE_URL=http://localhost:8000`

Optional Stripe storefront variables, test mode only:

- `NEXT_PUBLIC_STRIPE_KEY`
- `NEXT_PUBLIC_MEDUSA_PAYMENTS_PUBLISHABLE_KEY`

## Database, Admin, Seed

Run after PostgreSQL is available and `DATABASE_URL` is set:

```bash
cd apps/backend
pnpm medusa db:migrate
pnpm medusa user -e admin@test.com -p supersecret
pnpm medusa exec ./src/migration-scripts/initial-data-seed.ts
pnpm dev
```

Admin URL:

- `http://localhost:9000/app`

The seed creates:

- Default Store
- Default Sales Channel
- Default Publishable API Key linked to the default sales channel
- Europe region using countries `gb`, `de`, `dk`, `se`, `fr`, `es`, `it`
- manual payment provider `pp_system_default`
- manual fulfillment/shipping options
- demo categories and products
- inventory levels

## Storefront

After adding the publishable key to `apps/storefront/.env.local`:

```bash
cd apps/storefront
pnpm dev
```

Storefront URL:

- `http://localhost:8000`

## Publishable API Key, Region, Sales Channel

In Medusa Admin:

- Publishable API key: Settings -> Publishable API Keys. Copy the token, not only the ID.
- Sales channel ID: Settings -> Sales Channels, or open the sales channel and copy its `sc_...` ID.
- Region ID: Settings -> Regions, or use Store API `GET /store/regions` with the publishable key and copy the `reg_...` ID.

QAY should paste:

- Backend URL: `http://localhost:9000`
- Publishable key: the seeded/admin-created publishable key token
- Region ID: optional for MVP; use the seeded Europe `reg_...` if QAY wants deterministic pricing/countries
- Sales channel ID: optional for MVP; publishable key already scopes Store API requests to linked sales channels

Medusa docs confirm Store API requests must include `x-publishable-api-key`; publishable keys are scoped to sales channels and product/store requests depend on that scope.

## Test Checkout

With the default seed, checkout uses manual test payments:

1. Start backend at `http://localhost:9000`.
2. Start storefront at `http://localhost:8000`.
3. Open `http://localhost:8000/dk`.
4. Browse products and add an item to cart.
5. Go to cart, then checkout.
6. Enter a DK/Europe shipping address.
7. Choose Standard or Express Shipping.
8. Choose Manual Payment.
9. Place the order.
10. Confirm the order appears in Medusa Admin.

Stripe test checkout is not confirmed in this starter until the backend payment provider is added/configured. Use Stripe test keys only.

## QAY Store API Notes

All Store API calls use:

```http
x-publishable-api-key: <publishable key token>
Content-Type: application/json
```

Core QAY endpoints:

- List products: `GET /store/products?region_id=<reg_id>&limit=12&offset=0`
- Product by handle: `GET /store/products?handle=<handle>&region_id=<reg_id>`
- Product by ID: `GET /store/products/<product_id>?region_id=<reg_id>`
- List regions: `GET /store/regions`
- Retrieve region: `GET /store/regions/<region_id>`
- Create cart: `POST /store/carts` with `{ "region_id": "reg_..." }`
- Retrieve cart: `GET /store/carts/<cart_id>`
- Add to cart: `POST /store/carts/<cart_id>/line-items` with `{ "variant_id": "variant_...", "quantity": 1 }`
- Update cart addresses/email: `POST /store/carts/<cart_id>` with shipping, billing, email fields
- List shipping options: `GET /store/shipping-options?cart_id=<cart_id>`
- Add shipping method: `POST /store/carts/<cart_id>/shipping-methods` with `{ "option_id": "so_..." }`
- List payment providers: `GET /store/payment-providers?region_id=<reg_id>`
- Initiate payment session: `POST /store/payment-collections/<payment_collection_id>/payment-sessions`
- Complete cart/order: `POST /store/carts/<cart_id>/complete`
- Customer signup auth: `POST /auth/customer/emailpass/register`
- Customer login auth: `POST /auth/customer/emailpass`
- Current customer: `GET /store/customers/me` with customer auth token

Admin patterns for orders/customers:

- Use Admin API with an admin bearer token or secret/admin integration token.
- Never expose Admin API tokens in QAY client-side pages.
- QAY should proxy admin-only operations through QAY backend services if needed.

## Multi-Site MVP Strategy

Safest MVP:

- One Medusa backend.
- QAY stores per-site connection config.
- Each QAY site stores backend URL + publishable key.
- Use optional region ID and sales channel ID for filtering/admin display.
- Prefer one publishable key per QAY site once multiple QAY sites need separate catalog visibility.
- Link each publishable key to one or more sales channels in Medusa Admin.

Avoid one Medusa instance per site for MVP unless a merchant needs hard tenant isolation, separate deployment cadence, or separate infrastructure billing. It is more operationally expensive and slows builder onboarding.

Recommended evolution:

1. Single backend, single default sales channel/key for internal QAY pilot.
2. Single backend, one sales channel and one publishable key per QAY site.
3. Separate Medusa instances only for enterprise isolation or marketplace/merchant ownership boundaries.

## Webhook Plan

Start with Medusa subscribers that POST to QAY webhook endpoints. Keep the first version small and idempotent.

Useful Medusa events:

- `order.placed`: notify QAY that a checkout completed.
- `payment.captured`: mark payment capture in QAY analytics or order status.
- `payment.refunded`: update refund status.
- `order.canceled`: update canceled order status if enabled/available in the installed Medusa event reference.
- `customer.created`: sync customer identity if QAY later displays account widgets.
- `product.updated`: invalidate QAY product blocks/cache.
- inventory update events: invalidate availability/cache after confirming exact installed Medusa event names for inventory-level updates.

QAY webhook payloads should include event name, Medusa entity ID, backend/site connection ID, timestamp, and a signature. QAY should fetch fresh details from Medusa after receiving the event instead of trusting a large webhook payload.

## Verification Notes From This Machine

Completed:

- Installed dependencies with pnpm using the lockfile.
- Confirmed Next CLI resolves: `Next.js v15.5.18`.
- Confirmed the starter seed creates products, categories, region, shipping, inventory, publishable key, sales channel, and manual payment.
- Confirmed Stripe is storefront-ready but not backend-enabled by default.

Blocked locally:

- PostgreSQL and Redis are not installed/running here, so migrations, seed execution, backend runtime, Admin login, Store API browsing, cart, and checkout could not be fully exercised.
- Docker is not installed, so I could not start a disposable Postgres/Redis stack.
- Storefront build fails until `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` is set.
- Medusa CLI writes telemetry/config under the user config directory; in this sandbox it needs permission or an allowed config directory.

Official docs referenced:

- Publishable API keys and sales channel scoping: https://docs.medusajs.com/resources/storefront-development/publishable-api-keys
- Publishable keys with sales channels: https://docs.medusajs.com/resources/commerce-modules/sales-channel/publishable-api-keys
- Store API reference: https://docs.medusajs.com/api/store
- Cart Store API/SDK flow: https://docs.medusajs.com/resources/references/js-sdk/store/cart
- Events and subscribers: https://docs.medusajs.com/learn/fundamentals/events-and-subscribers
- Events reference: https://docs.medusajs.com/resources/references/events
