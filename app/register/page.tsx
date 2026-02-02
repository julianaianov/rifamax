"use client"

import { useState } from "react"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    documentId: "",
    phone: "",
    email: "",
    address: "",
    cep: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const passwordTooLong = form.password.length > 72
  const passwordTooShort = form.password.length > 0 && form.password.length < 8

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
      const res = await fetch(`${apiBase}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.email,
          password: form.password,
          name: form.fullName,
          cpf: form.documentId,
          address: `${form.address} - CEP: ${form.cep}`,
          phone: form.phone,
          email: form.email,
        }),
      })
      if (!res.ok) {
        setError("Não foi possível criar sua conta. Verifique os dados e tente novamente.")
        toast({ title: "Falha no cadastro", description: "Verifique os dados e tente novamente.", variant: "destructive" })
        return
      }
      // login automático
      const loginRes = await fetch(`${apiBase}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.email, password: form.password }),
      })
      if (loginRes.ok) {
        const data = await loginRes.json()
        if (data?.access_token) {
          localStorage.setItem("token", data.access_token)
        }
      }
      toast({ title: "Conta criada com sucesso", description: "Bem-vindo! Você será redirecionado ao painel." })
      window.location.href = "/admin"
    } catch {
      setError("Erro de rede. Tente novamente em instantes.")
      toast({ title: "Erro de rede", description: "Não foi possível conectar ao servidor.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Criar conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input id="fullName" value={form.fullName} onChange={(e)=>setForm({...form, fullName:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="documentId">Documento</Label>
                <Input id="documentId" value={form.documentId} onChange={(e)=>setForm({...form, documentId:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E‑mail</Label>
                <Input id="email" type="email" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cep">CEP</Label>
                <Input id="cep" value={form.cep} onChange={(e)=>setForm({...form, cep:e.target.value})} required />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="address">Endereço</Label>
                <Input id="address" value={form.address} onChange={(e)=>setForm({...form, address:e.target.value})} required />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" value={form.password} onChange={(e)=>setForm({...form, password:e.target.value})} required />
                {passwordTooLong ? (
                  <p className="text-xs text-destructive">
                    A senha está muito longa. Temporariamente, use no máximo 72 caracteres.
                  </p>
                ) : passwordTooShort ? (
                  <p className="text-xs text-destructive">A senha precisa ter ao menos 8 caracteres.</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Requisitos: mínimo 8 caracteres. Temporariamente, máximo 72 caracteres.
                  </p>
                )}
              </div>
              {error && (
                <div className="sm:col-span-2 rounded-md border border-red-600 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </div>
              )}
              <div className="sm:col-span-2 flex flex-col gap-2">
                <Button type="submit" disabled={loading || passwordTooLong || passwordTooShort}>
                  {loading ? "Criando..." : "Criar conta"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Já tem conta? <Link className="underline" href="/login">Entrar</Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  )
}

