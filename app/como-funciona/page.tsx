"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield, ShoppingCart, Trophy, Wallet } from "lucide-react"

export default function ComoFuncionaPage() {
  const steps = [
    {
      icon: Shield,
      title: "1. Crie sua conta",
      desc: "Cadastre-se rapidamente para gerenciar rifas e acompanhar compras.",
    },
    {
      icon: ShoppingCart,
      title: "2. Escolha números",
      desc: "Selecione seus números favoritos e finalize a compra com segurança.",
    },
    {
      icon: Wallet,
      title: "3. Pagamento",
      desc: "Pague online e receba a confirmação por e‑mail e WhatsApp.",
    },
    {
      icon: Trophy,
      title: "4. Acompanhe o sorteio",
      desc: "Assista ao vivo e receba o resultado no seu painel pessoal.",
    },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <section className="border-b border-border py-14">
          <div className="mx-auto max-w-5xl px-4 lg:px-8">
            <h1 className="text-3xl font-bold text-foreground">Como funciona</h1>
            <p className="mt-2 text-muted-foreground">
              Entenda em poucos passos como participar e/ou criar sua rifa.
            </p>
          </div>
        </section>
        <section className="py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
            {steps.map((s) => (
              <Card key={s.title}>
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <s.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
        <section className="border-t border-border py-12">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 text-center lg:px-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Pronto para começar?
            </h2>
            <p className="text-muted-foreground">
              Crie sua conta para comprar rifas e/ou criar a sua própria rifa.
            </p>
            <div className="mt-2">
              <Link href="/register">
                <Button size="lg" className="gap-2">Criar conta</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

