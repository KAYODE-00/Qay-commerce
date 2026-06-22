import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyQay } from "./qay-webhook"

export default async function orderPlacedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  await notifyQay("order.placed", data)
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
