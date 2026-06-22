import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyQay } from "./qay-webhook"

export default async function paymentCapturedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  await notifyQay("payment.captured", data)
}

export const config: SubscriberConfig = {
  event: "payment.captured",
}
