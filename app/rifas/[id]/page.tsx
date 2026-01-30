"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { NumberGrid } from "@/components/number-grid"
import { PurchaseForm } from "@/components/purchase-form"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Trophy, Users, ArrowLeft } from "lucide-react"
import Link from "next/link"
import type { Raffle, RaffleNumber } from "@/lib/types"

// Mock data - will be replaced with API
const mockRaffle: Raffle = {
  id: "1",
  title: "iPhone 15 Pro Max 256GB",
  description: "Concorra a um iPhone 15 Pro Max novinho na caixa lacrada com garantia Apple. O aparelho sera entregue diretamente na sua casa em ate 7 dias apos o sorteio. Cores disponiveis: Titanio Natural, Titanio Azul, Titanio Branco e Titanio Preto.",
  prize: "iPhone 15 Pro Max",
  price: 5.0,
  total_numbers: 100,
  draw_date: "2025-02-15",
  status: "active",
  created_at: "2025-01-01",
  image_url: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=60",
}

// Mock sold numbers
const mockSoldNumbers: RaffleNumber[] = [
  { number: 7, raffle_id: "1", status: "sold", buyer_name: "Joao" },
  { number: 12, raffle_id: "1", status: "sold", buyer_name: "Maria" },
  { number: 23, raffle_id: "1", status: "sold", buyer_name: "Pedro" },
  { number: 34, raffle_id: "1", status: "reserved" },
  { number: 45, raffle_id: "1", status: "sold", buyer_name: "Ana" },
  { number: 56, raffle_id: "1", status: "sold", buyer_name: "Carlos" },
  { number: 67, raffle_id: "1", status: "reserved" },
  { number: 78, raffle_id: "1", status: "sold", buyer_name: "Julia" },
  { number: 89, raffle_id: "1", status: "sold", buyer_name: "Lucas" },
  { number: 99, raffle_id: "1", status: "sold", buyer_name: "Mariana" },
]

export default function RaffleDetailPage() {
  const params = useParams()
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([])
  const [numbers, setNumbers] = useState<RaffleNumber[]>(mockSoldNumbers)

  const raffle = mockRaffle // Will fetch from API based on params.id

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(raffle.price)

  const formattedDate = new Date(raffle.draw_date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const soldCount = numbers.filter((n) => n.status === "sold").length
  const reservedCount = numbers.filter((n) => n.status === "reserved").length
  const availableCount = raffle.total_numbers - soldCount - reservedCount

  const handleNumberClick = (num: number) => {
    setSelectedNumbers((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    )
  }

  const handlePurchaseSuccess = () => {
    // Add selected numbers as sold
    const newNumbers = selectedNumbers.map((num) => ({
      number: num,
      raffle_id: raffle.id,
      status: "sold" as const,
    }))
    setNumbers((prev) => [...prev, ...newNumbers])
    setSelectedNumbers([])
  }

  const selectRandom = (count: number) => {
    const available = Array.from({ length: raffle.total_numbers }, (_, i) => i + 1).filter(
      (num) => {
        const found = numbers.find((n) => n.number === num)
        return !found || found.status === "available"
      }
    )
    const shuffled = available.sort(() => Math.random() - 0.5)
    setSelectedNumbers(shuffled.slice(0, count))
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <Link
            href="/rifas"
            className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Rifas
          </Link>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="space-y-6 lg:col-span-2">
              {/* Raffle Info */}
              <Card>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg bg-secondary">
                    {raffle.image_url ? (
                      <img
                        src={raffle.image_url || "/placeholder.svg"}
                        alt={raffle.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <Trophy className="h-20 w-20 text-muted-foreground/50" />
                      </div>
                    )}
                    <Badge className="absolute right-4 top-4" variant="default">
                      Ativa
                    </Badge>
                  </div>
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-foreground">{raffle.title}</h1>
                    <p className="mt-3 text-muted-foreground">{raffle.description}</p>

                    <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg bg-secondary p-3 text-center">
                        <p className="text-xs text-muted-foreground">Premio</p>
                        <p className="mt-1 font-semibold text-accent">{raffle.prize}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3 text-center">
                        <p className="text-xs text-muted-foreground">Por Numero</p>
                        <p className="mt-1 font-semibold text-primary">{formattedPrice}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3 text-center">
                        <p className="text-xs text-muted-foreground">Sorteio</p>
                        <p className="mt-1 text-sm font-semibold text-foreground">{formattedDate}</p>
                      </div>
                      <div className="rounded-lg bg-secondary p-3 text-center">
                        <p className="text-xs text-muted-foreground">Disponiveis</p>
                        <p className="mt-1 font-semibold text-foreground">
                          {availableCount}/{raffle.total_numbers}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Number Selection */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-foreground">
                        Escolha seus numeros
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Clique nos numeros para selecionar
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectRandom(5)}
                      >
                        +5 Aleatorios
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => selectRandom(10)}
                      >
                        +10 Aleatorios
                      </Button>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded border border-border bg-card" />
                      <span className="text-muted-foreground">Disponivel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-primary" />
                      <span className="text-muted-foreground">Selecionado</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-destructive/20" />
                      <span className="text-muted-foreground">Vendido</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-accent/20" />
                      <span className="text-muted-foreground">Reservado</span>
                    </div>
                  </div>

                  <NumberGrid
                    totalNumbers={raffle.total_numbers}
                    numbers={numbers}
                    selectedNumbers={selectedNumbers}
                    onNumberClick={handleNumberClick}
                  />

                  {selectedNumbers.length > 0 && (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-primary/10 p-4">
                      <span className="text-sm text-foreground">
                        {selectedNumbers.length} numero(s) selecionado(s)
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedNumbers([])}
                      >
                        Limpar
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <PurchaseForm
                selectedNumbers={selectedNumbers}
                pricePerNumber={raffle.price}
                raffleId={raffle.id}
                onSuccess={handlePurchaseSuccess}
              />

              {/* Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground">Estatisticas</h3>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Vendidos</span>
                      <span className="font-medium text-destructive">{soldCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Reservados</span>
                      <span className="font-medium text-accent">{reservedCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Disponiveis</span>
                      <span className="font-medium text-primary">{availableCount}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total</span>
                        <span className="font-medium text-foreground">
                          {raffle.total_numbers}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
