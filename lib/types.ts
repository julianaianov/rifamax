export interface Raffle {
  id: string
  title: string
  description: string
  prize: string
  price: number
  total_numbers: number
  image_url?: string
  draw_date: string
  status: "active" | "completed" | "cancelled"
  winner_number?: number
  created_at: string
}

export interface RaffleNumber {
  number: number
  raffle_id: string
  buyer_name?: string
  buyer_phone?: string
  buyer_email?: string
  status: "available" | "reserved" | "sold"
  reserved_at?: string
  sold_at?: string
}

export interface Purchase {
  id: string
  raffle_id: string
  numbers: number[]
  buyer_name: string
  buyer_phone: string
  buyer_email: string
  total_amount: number
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
}
