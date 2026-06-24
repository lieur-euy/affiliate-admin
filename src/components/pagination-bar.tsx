import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationBarProps {
  page: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
  isLoading: boolean
  onNext: () => void
  onPrev: () => void
}

export function PaginationBar({
  page,
  totalPages,
  hasNext,
  hasPrev,
  isLoading,
  onNext,
  onPrev,
}: PaginationBarProps) {
  if (totalPages <= 1 && !hasNext) return null

  return (
    <div className="mt-4 flex items-center justify-between border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page}
        {totalPages > 1 && ` of ${totalPages}`}
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPrev || isLoading}
          onClick={onPrev}
        >
          <ChevronLeft className="mr-1 size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNext || isLoading}
          onClick={onNext}
        >
          Next
          <ChevronRight className="ml-1 size-4" />
        </Button>
      </div>
    </div>
  )
}
