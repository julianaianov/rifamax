import { NextResponse } from "next/server"

// Simulated in-memory storage
const purchases: Map<string, object> = new Map()
const numbers: Map<string, object[]> = new Map([
  [
    "1",
    [
      { number: 7, raffle_id: "1", status: "sold", buyer_name: "Joao" },
      { number: 12, raffle_id: "1", status: "sold", buyer_name: "Maria" },
      { number: 23, raffle_id: "1", status: "sold", buyer_name: "Pedro" },
      { number: 45, raffle_id: "1", status: "sold", buyer_name: "Ana" },
    ],
  ],
])

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { raffle_id, numbers: selectedNumbers, buyer_name, buyer_phone, buyer_email } = body

    // Validate required fields
    if (!raffle_id || !selectedNumbers?.length || !buyer_name || !buyer_phone || !buyer_email) {
      return NextResponse.json(
        { error: "Dados incompletos" },
        { status: 400 }
      )
    }

    // Check if numbers are available
    const existingNumbers = numbers.get(raffle_id) || []
    const takenNumbers = new Set(existingNumbers.map((n: {number: number}) => n.number))

    for (const num of selectedNumbers) {
      if (takenNumbers.has(num)) {
        return NextResponse.json(
          { error: `Numero ${num} ja foi vendido` },
          { status: 400 }
        )
      }
    }

    // Create purchase
    const purchaseId = String(Date.now())
    const purchase = {
      id: purchaseId,
      raffle_id,
      numbers: selectedNumbers,
      buyer_name,
      buyer_phone,
      buyer_email,
      total_amount: selectedNumbers.length * 5, // Assuming R$5 per number
      status: "confirmed",
      created_at: new Date().toISOString(),
    }

    purchases.set(purchaseId, purchase)

    // Mark numbers as sold
    const currentNumbers = numbers.get(raffle_id) || []
    for (const num of selectedNumbers) {
      currentNumbers.push({
        number: num,
        raffle_id,
        buyer_name,
        buyer_phone,
        buyer_email,
        status: "sold",
        sold_at: new Date().toISOString(),
      })
    }
    numbers.set(raffle_id, currentNumbers)

    return NextResponse.json(purchase, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erro ao processar compra" },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(Array.from(purchases.values()))
}
