"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Ticket,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Trophy,
  Eye,
  Trash2,
  Play,
} from "lucide-react"
import type { Raffle } from "@/lib/types"

// Inicial vazio; será preenchido conforme o usuário criar novas rifas
const initialRaffles: Raffle[] = []

const mockStats = {
  totalRaffles: 0,
  activeRaffles: 0,
  totalSales: 0,
  totalRevenue: 0.0,
}

const mockSoldNumbers: Record<string, number> = {}

export default function AdminPage() {
  // Require login: if no token, redirect to /login
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token")
    if (!token) {
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }
  }

  const [raffles, setRaffles] = useState<Raffle[]>(initialRaffles)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isDrawOpen, setIsDrawOpen] = useState(false)
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null)
  const [drawResult, setDrawResult] = useState<{ number: number; name: string } | null>(null)
  const [newRaffle, setNewRaffle] = useState({
    title: "",
    description: "",
    prize: "",
    price: "",
    total_numbers: "",
    draw_date: "",
    image_url: "",
  })
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  const handleCreateRaffle = async () => {
    // Create via FastAPI; fallback to local state on failure
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
    try {
      const res = await fetch(`${apiBaseUrl}/api/raffles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newRaffle.title,
          description: newRaffle.description,
          prize: newRaffle.prize,
          price: Number.parseFloat(newRaffle.price),
          total_numbers: Number.parseInt(newRaffle.total_numbers),
          draw_date: newRaffle.draw_date,
          image_url: newRaffle.image_url || null,
        }),
      })
      if (res.ok) {
        const created = (await res.json()) as Raffle
        setRaffles([...raffles, created])
      } else {
        // fallback local
        const raffle: Raffle = {
          id: String(Date.now()),
          title: newRaffle.title,
          description: newRaffle.description,
          prize: newRaffle.prize,
          price: Number.parseFloat(newRaffle.price),
          total_numbers: Number.parseInt(newRaffle.total_numbers),
          draw_date: newRaffle.draw_date,
          image_url: newRaffle.image_url || undefined,
          status: "active",
          created_at: new Date().toISOString(),
        }
        setRaffles([...raffles, raffle])
      }
    } catch {
      // fallback on network error
      const raffle: Raffle = {
        id: String(Date.now()),
        title: newRaffle.title,
        description: newRaffle.description,
        prize: newRaffle.prize,
        price: Number.parseFloat(newRaffle.price),
        total_numbers: Number.parseInt(newRaffle.total_numbers),
        draw_date: newRaffle.draw_date,
        image_url: newRaffle.image_url || undefined,
        status: "active",
        created_at: new Date().toISOString(),
      }
      setRaffles([...raffles, raffle])
    } finally {
      setNewRaffle({
        title: "",
        description: "",
        prize: "",
        price: "",
        total_numbers: "",
        draw_date: "",
        image_url: "",
      })
      setIsCreateOpen(false)
    }
  }

  const handleDeleteRaffle = (id: string) => {
    setRaffles(raffles.filter((r) => r.id !== id))
  }

  const handleDraw = (raffle: Raffle) => {
    setSelectedRaffle(raffle)
    setDrawResult(null)
    setIsDrawOpen(true)
  }

  const executeDraw = () => {
    if (!selectedRaffle) return
    
    const sold = mockSoldNumbers[selectedRaffle.id] || 10
    const winnerNumber = Math.floor(Math.random() * sold) + 1
    const names = ["Joao Silva", "Maria Santos", "Pedro Oliveira", "Ana Costa", "Carlos Lima"]
    const winnerName = names[Math.floor(Math.random() * names.length)]
    
    setDrawResult({ number: winnerNumber, name: winnerName })
    setRaffles(
      raffles.map((r) =>
        r.id === selectedRaffle.id
          ? { ...r, status: "completed" as const, winner_number: winnerNumber }
          : r
      )
    )
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Painel Administrativo</h1>
              <p className="mt-1 text-muted-foreground">
                Gerencie suas rifas e acompanhe as vendas
              </p>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Nova Rifa
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>Criar Nova Rifa</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Titulo</Label>
                    <Input
                      id="title"
                      placeholder="Ex: iPhone 15 Pro Max"
                      value={newRaffle.title}
                      onChange={(e) =>
                        setNewRaffle({ ...newRaffle, title: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descricao</Label>
                    <Textarea
                      id="description"
                      placeholder="Descreva o premio..."
                      value={newRaffle.description}
                      onChange={(e) =>
                        setNewRaffle({ ...newRaffle, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="prize">Premio</Label>
                      <Input
                        id="prize"
                        placeholder="Ex: iPhone 15"
                        value={newRaffle.prize}
                        onChange={(e) =>
                          setNewRaffle({ ...newRaffle, prize: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="price">Preco por Numero (R$)</Label>
                      <Input
                        id="price"
                        type="number"
                        step="0.01"
                        placeholder="5.00"
                        value={newRaffle.price}
                        onChange={(e) =>
                          setNewRaffle({ ...newRaffle, price: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="total_numbers">Total de Numeros</Label>
                      <Input
                        id="total_numbers"
                        type="number"
                        placeholder="100"
                        value={newRaffle.total_numbers}
                        onChange={(e) =>
                          setNewRaffle({ ...newRaffle, total_numbers: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="draw_date">Data do Sorteio</Label>
                      <Input
                        id="draw_date"
                        type="date"
                        value={newRaffle.draw_date}
                        onChange={(e) =>
                          setNewRaffle({ ...newRaffle, draw_date: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_url">URL da Imagem (opcional)</Label>
                    <Input
                      id="image_url"
                      placeholder="https://..."
                      value={newRaffle.image_url}
                      onChange={(e) =>
                        setNewRaffle({ ...newRaffle, image_url: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image_file">Ou enviar imagem</Label>
                    <Input
                      id="image_file"
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        setUploading(true)
                        try {
                          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
                          const fd = new FormData()
                          fd.append("file", file)
                          const res = await fetch(`${apiBaseUrl}/api/upload-image`, {
                            method: "POST",
                            body: fd,
                          })
                          if (!res.ok) {
                            toast({ title: "Falha no upload", description: "Não foi possível enviar a imagem.", variant: "destructive" })
                          } else {
                            const data = await res.json()
                            setNewRaffle((r) => ({ ...r, image_url: data.url }))
                            toast({ title: "Imagem enviada", description: "Upload concluído com sucesso." })
                          }
                        } catch {
                          toast({ title: "Erro de rede", description: "Falha ao enviar a imagem.", variant: "destructive" })
                        } finally {
                          setUploading(false)
                        }
                      }}
                    />
                    {newRaffle.image_url && (
                      <div className="rounded-lg border p-2">
                        <img src={newRaffle.image_url} alt="Pré-visualização" className="h-28 w-full object-cover" />
                      </div>
                    )}
                    {uploading && <p className="text-xs text-muted-foreground">Enviando imagem...</p>}
                  </div>
                  <Button onClick={handleCreateRaffle} className="w-full">
                    Criar Rifa
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <Ticket className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total de Rifas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockStats.totalRaffles}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">
                  <TrendingUp className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Rifas Ativas</p>
                  <p className="text-2xl font-bold text-foreground">
                    {raffles.filter((r) => r.status === "active").length}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-chart-3/10">
                  <Users className="h-6 w-6 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Numeros Vendidos</p>
                  <p className="text-2xl font-bold text-foreground">
                    {mockStats.totalSales}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Receita Total</p>
                  <p className="text-2xl font-bold text-foreground">
                    {formatCurrency(mockStats.totalRevenue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Raffles Table */}
          <Card>
            <CardHeader>
              <CardTitle>Rifas</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rifa</TableHead>
                    <TableHead>Premio</TableHead>
                    <TableHead className="text-center">Preco</TableHead>
                    <TableHead className="text-center">Vendidos</TableHead>
                    <TableHead className="text-center">Sorteio</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {raffles.map((raffle) => {
                    const sold = mockSoldNumbers[raffle.id] || 0
                    const progress = (sold / raffle.total_numbers) * 100
                    return (
                      <TableRow key={raffle.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 overflow-hidden rounded-lg bg-secondary">
                              {raffle.image_url ? (
                                <img
                                  src={raffle.image_url || "/placeholder.svg"}
                                  alt={raffle.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Trophy className="h-5 w-5 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{raffle.title}</p>
                              <p className="text-xs text-muted-foreground">
                                #{raffle.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-accent">{raffle.prize}</TableCell>
                        <TableCell className="text-center">
                          {formatCurrency(raffle.price)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-sm">
                              {sold}/{raffle.total_numbers}
                            </span>
                            <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
                              <div
                                className="h-full bg-primary"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {formatDate(raffle.draw_date)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={raffle.status === "active" ? "default" : "secondary"}
                          >
                            {raffle.status === "active" ? "Ativa" : "Encerrada"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="icon" asChild>
                              <a href={`/rifas/${raffle.id}`}>
                                <Eye className="h-4 w-4" />
                              </a>
                            </Button>
                            {raffle.status === "active" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDraw(raffle)}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteRaffle(raffle.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Draw Dialog */}
      <Dialog open={isDrawOpen} onOpenChange={setIsDrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Realizar Sorteio</DialogTitle>
          </DialogHeader>
          {selectedRaffle && (
            <div className="py-4">
              {!drawResult ? (
                <div className="space-y-4 text-center">
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Rifa</p>
                    <p className="font-semibold text-foreground">
                      {selectedRaffle.title}
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    Numeros vendidos: {mockSoldNumbers[selectedRaffle.id] || 0}
                  </p>
                  <Button onClick={executeDraw} className="w-full gap-2">
                    <Play className="h-4 w-4" />
                    Sortear Agora
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
                    <Trophy className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Numero Sorteado</p>
                    <p className="text-4xl font-bold text-primary">
                      {String(drawResult.number).padStart(2, "0")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="text-sm text-muted-foreground">Ganhador</p>
                    <p className="font-semibold text-foreground">{drawResult.name}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsDrawOpen(false)}
                    className="w-full"
                  >
                    Fechar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  )
}
