import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyQay } from "./qay-webhook"

export default async function customerCreatedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  await notifyQay("customer.created", data)
}

export const config: SubscriberConfig = {
  event: "customer.created",
}
