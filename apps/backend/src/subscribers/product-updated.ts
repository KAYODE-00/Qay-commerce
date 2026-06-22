import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { notifyQay } from "./qay-webhook"

export default async function productUpdatedHandler({
  event: { data },
}: SubscriberArgs<{ id: string }>) {
  await notifyQay("product.updated", data)
}

export const config: SubscriberConfig = {
  event: "product.updated",
}
