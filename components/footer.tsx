import Link from "next/link"
import { Ticket } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Ticket className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">Rifa Aí</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              A melhor plataforma de rifas online do Brasil. Segura, transparente e confiavel.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/rifas"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Rifas Ativas
                </Link>
              </li>
              <li>
                <Link
                  href="/como-funciona"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Como Funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/ganhadores"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ganhadores
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Suporte
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contato"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contato
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/termos"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Termos de Uso
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Contato
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>contato@rifa.com.br</li>
              <li>(11) 99999-9999</li>
              <li>Seg - Sex: 9h - 18h</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            2025 Rifa Aí. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
