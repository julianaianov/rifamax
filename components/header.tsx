"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Ticket, Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <Ticket className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">Rifa Aí</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Inicio
          </Link>
          <Link
            href="/rifas"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Rifas
          </Link>
          <Link
            href="/como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como Funciona
          </Link>
          <Link
            href="/contato"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Contato
          </Link>
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/admin">
            <Button variant="ghost" size="sm">
              Admin
            </Button>
          </Link>
          <Link href="/rifas">
            <Button size="sm">Participar</Button>
          </Link>
        </div>

        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="border-t border-border md:hidden">
          <div className="space-y-1 px-4 py-4">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Inicio
            </Link>
            <Link
              href="/rifas"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Rifas
            </Link>
            <Link
              href="/como-funciona"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Como Funciona
            </Link>
            <Link
              href="/contato"
              className="block rounded-lg px-3 py-2 text-base font-medium text-foreground hover:bg-secondary"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </Link>
            <div className="flex gap-2 pt-4">
              <Link href="/admin" className="flex-1">
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  Admin
                </Button>
              </Link>
              <Link href="/rifas" className="flex-1">
                <Button size="sm" className="w-full">
                  Participar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
