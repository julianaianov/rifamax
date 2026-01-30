"use client"

import { cn } from "@/lib/utils"
import type { RaffleNumber } from "@/lib/types"

interface NumberGridProps {
  totalNumbers: number
  numbers: RaffleNumber[]
  selectedNumbers: number[]
  onNumberClick: (num: number) => void
}

export function NumberGrid({
  totalNumbers,
  numbers,
  selectedNumbers,
  onNumberClick,
}: NumberGridProps) {
  const getNumberStatus = (num: number): RaffleNumber["status"] => {
    const found = numbers.find((n) => n.number === num)
    return found?.status ?? "available"
  }

  return (
    <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
      {Array.from({ length: totalNumbers }, (_, i) => i + 1).map((num) => {
        const status = getNumberStatus(num)
        const isSelected = selectedNumbers.includes(num)
        const isAvailable = status === "available"

        return (
          <button
            key={num}
            type="button"
            onClick={() => isAvailable && onNumberClick(num)}
            disabled={!isAvailable}
            className={cn(
              "flex h-10 w-full items-center justify-center rounded-lg border text-sm font-medium transition-all",
              isAvailable && !isSelected && "border-border bg-card text-foreground hover:border-primary hover:bg-primary/10",
              isSelected && "border-primary bg-primary text-primary-foreground",
              status === "sold" && "cursor-not-allowed border-destructive/30 bg-destructive/10 text-destructive/50",
              status === "reserved" && "cursor-not-allowed border-accent/30 bg-accent/10 text-accent/50"
            )}
          >
            {String(num).padStart(2, "0")}
          </button>
        )
      })}
    </div>
  )
}
