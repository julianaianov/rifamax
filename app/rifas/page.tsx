import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RaffleCard } from "@/components/raffle-card"
import type { Raffle } from "@/lib/types"

const mockRaffles: Raffle[] = [
  {
    id: "1",
    title: "iPhone 15 Pro Max 256GB",
    description: "Concorra a um iPhone 15 Pro Max novinho na caixa lacrada com garantia Apple.",
    prize: "iPhone 15 Pro Max",
    price: 5.0,
    total_numbers: 100,
    draw_date: "2025-02-15",
    status: "active",
    created_at: "2025-01-01",
    image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "2",
    title: "PlayStation 5 + 3 Jogos",
    description: "Console PlayStation 5 edicao digital com 3 jogos a escolha do ganhador.",
    prize: "PS5 Digital",
    price: 3.0,
    total_numbers: 200,
    draw_date: "2025-02-20",
    status: "active",
    created_at: "2025-01-05",
    image_url: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "3",
    title: "Notebook Gamer ASUS ROG",
    description: "Notebook gamer de alta performance com RTX 4070 e processador Intel i9.",
    prize: "Notebook Gamer",
    price: 10.0,
    total_numbers: 150,
    draw_date: "2025-03-01",
    status: "active",
    created_at: "2025-01-10",
    image_url: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "4",
    title: "Smart TV Samsung 65 4K",
    description: "TV Samsung Crystal UHD 65 polegadas com tecnologia 4K e smart hub.",
    prize: "Smart TV 65\"",
    price: 8.0,
    total_numbers: 120,
    draw_date: "2025-02-28",
    status: "active",
    created_at: "2025-01-12",
    image_url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "5",
    title: "Apple Watch Ultra 2",
    description: "Relogio Apple Watch Ultra 2 com GPS e Cellular, perfeito para esportes.",
    prize: "Apple Watch Ultra 2",
    price: 4.0,
    total_numbers: 80,
    draw_date: "2025-02-25",
    status: "active",
    created_at: "2025-01-15",
    image_url: "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=800&auto=format&fit=crop&q=60",
  },
  {
    id: "6",
    title: "Xbox Series X + Game Pass",
    description: "Console Xbox Series X com 1 ano de Game Pass Ultimate incluso.",
    prize: "Xbox Series X",
    price: 5.0,
    total_numbers: 150,
    draw_date: "2025-03-05",
    status: "active",
    created_at: "2025-01-18",
    image_url: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=800&auto=format&fit=crop&q=60",
  },
]

const soldNumbers = [45, 120, 80, 60, 50, 90]

export default function RafflesPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-foreground">Rifas Ativas</h1>
            <p className="mt-2 text-muted-foreground">
              Escolha uma rifa e participe para concorrer a premios incriveis
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {mockRaffles.map((raffle, index) => (
              <RaffleCard
                key={raffle.id}
                raffle={raffle}
                soldNumbers={soldNumbers[index]}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
