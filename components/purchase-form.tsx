"use client"

import React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

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
    fullName: "",
    documentId: "",
    phone: "",
    email: "",
    address: "",
    cep: "",
    password: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()

  const total = selectedNumbers.length * pricePerNumber
  const formattedTotal = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(total)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // 1) Register or login user on FastAPI (username = email)
      const apiBaseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"

      // Basic validations (extra guard; inputs are required too)
      if (
        !formData.fullName ||
        !formData.documentId ||
        !formData.phone ||
        !formData.email ||
        !formData.address ||
        !formData.cep ||
        !formData.password
      ) {
        setIsSubmitting(false)
        toast({
          title: "Preencha todos os campos",
          description: "Complete seus dados para continuar.",
          variant: "destructive",
        })
        return
      }

      // Attempt registration
      const registerRes = await fetch(`${apiBaseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
          name: formData.fullName,
          cpf: formData.documentId,
          address: `${formData.address} - CEP: ${formData.cep}`,
          phone: formData.phone,
          email: formData.email,
        }),
      })

      if (!registerRes.ok) {
        // If user exists, try login
        const loginRes = await fetch(`${apiBaseUrl}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: formData.email,
            password: formData.password,
          }),
        })
        if (!loginRes.ok) {
          console.error("Falha ao registrar/logar o usuario")
          toast({
            title: "Falha ao autenticar",
            description: "Não foi possível registrar/logar.",
            variant: "destructive",
          })
          setIsSubmitting(false)
          return
        }
      }

      // 2) Proceed to Stripe checkout via Next.js route
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          raffle_id: raffleId,
          numbers: selectedNumbers,
          buyer_name: formData.fullName,
          buyer_phone: formData.phone,
          buyer_email: formData.email,
          price_per_number: pricePerNumber,
          raffle_title: undefined,
        }),
      })

      if (!response.ok) {
        console.error("Erro ao iniciar checkout")
        toast({
          title: "Erro ao iniciar pagamento",
          description: "Tente novamente em instantes.",
          variant: "destructive",
        })
        return
      }
      const data = await response.json()
      if (data?.url) {
        toast({ title: "Redirecionando para pagamento" })
        window.location.href = data.url
      }
    } catch {
      console.error("Erro ao iniciar checkout")
      toast({
        title: "Erro de rede",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      })
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
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              placeholder="Seu nome completo"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentId">Documento (CPF, RG, Passaporte)</Label>
            <Input
              id="documentId"
              placeholder="Digite seu documento"
              value={formData.documentId}
              onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
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

          <div className="space-y-2">
            <Label htmlFor="address">Endereço</Label>
            <Input
              id="address"
              placeholder="Rua, numero, bairro, cidade, estado"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">CEP</Label>
            <Input
              id="cep"
              placeholder="00000-000"
              value={formData.cep}
              onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Crie sua senha (acesso à sua conta)</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
            disabled={
              isSubmitting ||
              selectedNumbers.length === 0 ||
              !formData.fullName ||
              !formData.documentId ||
              !formData.phone ||
              !formData.email ||
              !formData.address ||
              !formData.cep ||
              !formData.password
            }
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
