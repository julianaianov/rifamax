"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"

interface PurchaseFormProps {
  selectedNumbers: number[]
  pricePerNumber: number
  raffleId: string
  onSuccess: () => void
}

export function PurchaseForm({
  selectedNumbers,
  pricePerNumber,
  raffleId,
  onSuccess,
}: PurchaseFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const total = selectedNumbers.length * pricePerNumber
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(total)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffle_id: raffleId,
          numbers: selectedNumbers,
          buyer_name: formData.name,
          buyer_phone: formData.phone,
          buyer_email: formData.email,
          price_per_number: pricePerNumber,
          raffle_title: undefined,
        }),
      })

      if (!response.ok) {
        console.error("Erro ao iniciar checkout")
        return
      }
      const data = await response.json()
      if (data?.url) {
        window.location.href = data.url
      }
    } catch {
      console.error("Erro ao iniciar checkout")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="border-primary">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <CheckCircle2 className="h-16 w-16 text-primary" />
          <h3 className="mt-4 text-xl font-semibold text-foreground">
            Compra Realizada!
          </h3>
          <p className="mt-2 text-center text-muted-foreground">
            Seus numeros foram reservados com sucesso.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finalizar Compra</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input
              id="name"
              placeholder="Seu nome completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone (WhatsApp)</Label>
            <Input
              id="phone"
              placeholder="(11) 99999-9999"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div className="rounded-lg bg-secondary p-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Numeros selecionados</span>
              <span className="font-medium text-foreground">
                {selectedNumbers.length}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {selectedNumbers.sort((a, b) => a - b).map((num) => (
                <span
                  key={num}
                  className="rounded bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary"
                >
                  {String(num).padStart(2, "0")}
                </span>
              ))}
            </div>
            <div className="mt-4 flex justify-between border-t border-border pt-4">
              <span className="font-semibold text-foreground">Total</span>
              <span className="text-xl font-bold text-primary">{formattedTotal}</span>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting || selectedNumbers.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Compra"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
