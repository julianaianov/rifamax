import { NextResponse } from "next/server"
import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY

export async function POST(request: Request) {
  try {
    if (!stripeKey) {
      return NextResponse.json(
        { error: "Stripe não configurado. Defina STRIPE_SECRET_KEY no ambiente." },
        { status: 500 }
      )
    }

    const stripe = new Stripe(stripeKey)
    const body = await request.json()

    const {
      raffle_id,
      numbers,
      buyer_name,
      buyer_phone,
      buyer_email,
      price_per_number,
      raffle_title,
    } = body || {}

    if (
      !raffle_id ||
      !Array.isArray(numbers) ||
      numbers.length === 0 ||
      !buyer_name ||
      !buyer_phone ||
      !buyer_email ||
      typeof price_per_number !== "number"
    ) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    const unitAmount = Math.round(price_per_number * 100)
    const quantity = numbers.length

    const origin =
      (request.headers.get("origin") ??
        process.env.NEXT_PUBLIC_APP_URL ??
        "http://localhost:3000") + ""

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      customer_email: buyer_email,
      line_items: [
        {
          price_data: {
            currency: "brl",
            product_data: {
              name: raffle_title ? `Rifa: ${raffle_title}` : `Rifa ${raffle_id}`,
              description: `Compra de ${quantity} número(s): ${numbers
                .slice(0, 50)
                .join(", ")}`,
            },
            unit_amount: unitAmount,
          },
          quantity,
        },
      ],
      metadata: {
        raffle_id,
        numbers: JSON.stringify(numbers),
        buyer_name,
        buyer_phone,
        buyer_email,
      },
    })

    return NextResponse.json({ url: session.url }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Erro ao criar sessão de checkout" },
      { status: 500 }
    )
  }
}


