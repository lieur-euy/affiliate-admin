import { useState, useCallback, useRef } from "react"

interface PageEntry<T> {
  items: T[]
  nextCursor: string | null
}

export function useCursorPagination<T>(
  fetcher: (cursor?: string) => Promise<{ data: T[]; cursor: string | null }>,
  deps: unknown[] = [],
) {
  const [pages, setPages] = useState<PageEntry<T>[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const fetchIdRef = useRef(0)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const currentPage = pages[currentIdx]
  const items = currentPage?.items ?? []
  const hasNext = !!currentPage?.nextCursor
  const hasPrev = currentIdx > 0

  const loadFirst = useCallback(async () => {
    const id = ++fetchIdRef.current
    setIsLoading(true)
    setLoadError(null)
    setPages([])
    setCurrentIdx(0)
    try {
      const res = await fetcherRef.current(undefined)
      if (id === fetchIdRef.current) {
        setPages([{ items: res.data, nextCursor: res.cursor }])
      }
    } catch (err) {
      if (id === fetchIdRef.current) {
        setLoadError(err instanceof Error ? err.message : "Failed to load")
      }
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false)
    }
  }, deps)

  const loadNext = useCallback(async () => {
    if (!currentPage?.nextCursor) return
    const id = ++fetchIdRef.current
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetcherRef.current(currentPage.nextCursor)
      if (id === fetchIdRef.current) {
        setPages((prev) => [...prev, { items: res.data, nextCursor: res.cursor }])
        setCurrentIdx((prev) => prev + 1)
      }
    } catch (err) {
      if (id === fetchIdRef.current) {
        setLoadError(err instanceof Error ? err.message : "Failed to load")
      }
    } finally {
      if (id === fetchIdRef.current) setIsLoading(false)
    }
  }, [currentPage?.nextCursor, ...deps])

  const loadPrev = useCallback(() => {
    if (currentIdx <= 0) return
    setCurrentIdx((prev) => prev - 1)
  }, [currentIdx])

  return {
    items,
    isLoading,
    loadError,
    hasNext,
    hasPrev,
    loadFirst,
    loadNext,
    loadPrev,
    page: currentIdx + 1,
    totalPages: pages.length,
  }
}
