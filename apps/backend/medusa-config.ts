import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const stripeProvider = process.env.STRIPE_API_KEY
  ? {
      resolve: "@medusajs/medusa/payment-stripe",
      id: "stripe",
      options: {
        apiKey: process.env.STRIPE_API_KEY,
        webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
        capture: process.env.STRIPE_CAPTURE === "true",
        automatic_payment_methods:
          process.env.STRIPE_AUTOMATIC_PAYMENT_METHODS === "true",
      },
    }
  : null

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL || (process.env.NODE_ENV === 'production' ? 'https://qay-commerce.onrender.com' : 'http://localhost:9000'),
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: stripeProvider
    ? [
        {
          resolve: "@medusajs/medusa/payment",
          options: {
            providers: [stripeProvider],
          },
        },
      ]
    : [],
})
