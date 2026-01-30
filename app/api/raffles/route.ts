import { NextResponse } from "next/server"
import type { Raffle, RaffleNumber } from "@/lib/types"

// In-memory storage (replace with database in production)
const raffles: Map<string, Raffle> = new Map([
  [
    "1",
    {
      id: "1",
      title: "iPhone 15 Pro Max 256GB",
      description: "Concorra a um iPhone 15 Pro Max novinho na caixa lacrada com garantia Apple.",
      prize: "iPhone 15 Pro Max",
      price: 5.0,
      total_numbers: 100,
      image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60",
      draw_date: "2025-02-15",
      status: "active",
      created_at: "2025-01-01",
    },
  ],
  [
    "2",
    {
      id: "2",
      title: "PlayStation 5 + 3 Jogos",
      description: "Console PlayStation 5 edicao digital com 3 jogos a escolha do ganhador.",
      prize: "PS5 Digital",
      price: 3.0,
      total_numbers: 200,
      image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60",
      draw_date: "2025-02-20",
      status: "active",
      created_at: "2025-01-05",
    },
  ],
  [
    "3",
    {
      id: "3",
      title: "Notebook Gamer ASUS ROG",
      description: "Notebook gamer de alta performance com RTX 4070 e processador Intel i9.",
      prize: "Notebook Gamer",
      price: 10.0,
      total_numbers: 150,
      image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60",
      draw_date: "2025-03-01",
      status: "active",
      created_at: "2025-01-10",
    },
  ],
])

export const numbers: Map<string, RaffleNumber[]> = new Map([
  [
    "1",
    [
      { number: 7, raffle_id: "1", status: "sold", buyer_name: "Joao" },
      { number: 12, raffle_id: "1", status: "sold", buyer_name: "Maria" },
      { number: 23, raffle_id: "1", status: "sold", buyer_name: "Pedro" },
      { number: 45, raffle_id: "1", status: "sold", buyer_name: "Ana" },
    ],
  ],
  ["2", []],
  ["3", []],
])

export async function GET() {
  return NextResponse.json(Array.from(raffles.values()))
}

export async function POST(request: Request) {
  const body = await request.json()
  const id = String(Date.now())
  
  const newRaffle: Raffle = {
    id,
    ...body,
    status: "active",
    created_at: new Date().toISOString(),
  }
  
  raffles.set(id, newRaffle)
  numbers.set(id, [])
  
  return NextResponse.json(newRaffle, { status: 201 })
}

export { raffles }
