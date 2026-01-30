import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Users } from "lucide-react"
import type { Raffle } from "@/lib/types"

interface RaffleCardProps {
  raffle: Raffle
  soldNumbers?: number
}

export function RaffleCard({ raffle, soldNumbers = 0 }: RaffleCardProps) {
  const progress = (soldNumbers / raffle.total_numbers) * 100
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(raffle.price)

  const formattedDate = new Date(raffle.draw_date).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <Card className="group overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden bg-secondary">
          {raffle.image_url ? (
            <img
              src={raffle.image_url || "/placeholder.svg"}
              alt={raffle.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Trophy className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          <Badge
            className="absolute right-3 top-3"
            variant={raffle.status === "active" ? "default" : "secondary"}
          >
            {raffle.status === "active" ? "Ativa" : "Encerrada"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-4">
        <div>
          <h3 className="line-clamp-1 text-lg font-semibold text-foreground">
            {raffle.title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
            {raffle.description}
          </p>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {soldNumbers}/{raffle.total_numbers}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso</span>
            <span className="font-medium text-foreground">{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Premio</p>
            <p className="font-semibold text-accent">{raffle.prize}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Por numero</p>
            <p className="text-xl font-bold text-primary">{formattedPrice}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/rifas/${raffle.id}`} className="w-full">
          <Button className="w-full" disabled={raffle.status !== "active"}>
            {raffle.status === "active" ? "Participar Agora" : "Ver Resultado"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
