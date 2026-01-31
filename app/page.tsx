import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { RaffleCard } from "@/components/raffle-card"
import { ArrowRight, Shield, Zap, Trophy, Clock } from "lucide-react"
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
]

const features = [
  {
    icon: Shield,
    title: "100% Seguro",
    description: "Plataforma segura com certificacao SSL e pagamentos protegidos.",
  },
  {
    icon: Zap,
    title: "Sorteio Instantaneo",
    description: "Sorteios realizados ao vivo com transparencia total.",
  },
  {
    icon: Trophy,
    title: "Premios Garantidos",
    description: "Todos os premios sao entregues em ate 7 dias apos o sorteio.",
  },
  {
    icon: Clock,
    title: "Suporte 24/7",
    description: "Equipe de suporte disponivel para ajudar a qualquer momento.",
  },
]

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 lg:py-32">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Concorra a Premios Incriveis com a{" "}
                <span className="text-primary">Rifa Aí</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
                A plataforma mais confiavel de rifas online do Brasil. Escolha seus numeros,
                participe de sorteios e realize seus sonhos.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/rifas">
                  <Button size="lg" className="gap-2">
                    Ver Rifas Ativas
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/como-funciona">
                  <Button variant="outline" size="lg">
                    Como Funciona
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-y border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="flex flex-col items-center text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{feature.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Active Raffles Section */}
        <section className="py-16 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Rifas em Destaque
                </h2>
                <p className="mt-2 text-muted-foreground">
                  Confira as rifas mais populares do momento
                </p>
              </div>
              <Link href="/rifas" className="hidden sm:block">
                <Button variant="ghost" className="gap-2">
                  Ver Todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {mockRaffles.map((raffle, index) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  soldNumbers={[45, 120, 80][index]}
                />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/rifas">
                <Button variant="outline" className="gap-2 bg-transparent">
                  Ver Todas as Rifas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-border bg-card py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <div className="rounded-2xl bg-primary/10 p-8 lg:p-12">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
                  Pronto para participar?
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Escolha sua rifa favorita, selecione seus numeros da sorte e boa sorte!
                </p>
                <Link href="/rifas">
                  <Button size="lg" className="mt-8 gap-2">
                    Comecar Agora
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
