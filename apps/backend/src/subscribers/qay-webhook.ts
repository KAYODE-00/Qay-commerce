import crypto from "crypto"

type QayWebhookPayload = {
  event: string
  data: unknown
  emitted_at: string
}

const signPayload = (payload: string, secret: string) => {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex")
}

export const notifyQay = async (eventName: string, data: unknown) => {
  const url = process.env.QAY_WEBHOOK_URL

  if (!url) {
    return
  }

  const payload: QayWebhookPayload = {
    event: eventName,
    data,
    emitted_at: new Date().toISOString(),
  }

  const body = JSON.stringify(payload)
  const headers: Record<string, string> = {
    "content-type": "application/json",
    "x-qay-event": eventName,
  }

  if (process.env.QAY_WEBHOOK_SECRET) {
    headers["x-qay-signature"] = signPayload(
      body,
      process.env.QAY_WEBHOOK_SECRET
    )
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body,
  })

  if (!response.ok) {
    throw new Error(
      `QAY webhook failed for ${eventName}: ${response.status} ${response.statusText}`
    )
  }
}
