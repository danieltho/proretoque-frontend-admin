import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getClients, getClientApi } from '@/app/core/client/api/clientsApi'
import type { Client } from '@/app/core/client/types/client'
import type { SearchableSelectOption } from '@/app/components/ui/searchable-select'

export function useOrderClients(customerId?: number) {
  const [clients, setClients] = useState<Client[]>([])
  const [search, setSearch] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(false)

  const pageRef = useRef(1)
  const loadingRef = useRef(false)

  const fetchPage = useCallback(async (searchTerm: string, page: number, append: boolean) => {
    if (loadingRef.current && append) return

    loadingRef.current = true
    setLoading(true)
    try {
      const data = await getClients(page, searchTerm).send()
      const list = data.customers ?? []
      setClients((prev) => (append ? [...prev, ...list] : list))
      setHasMore(page < data.pages)
      pageRef.current = page
    } catch {
      if (!append) setHasMore(false)
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [])

  // Fetch first page when search changes
  useEffect(() => {
    pageRef.current = 1
    setHasMore(true)
    fetchPage(search, 1, false)
  }, [search, fetchPage])

  // If the selected client isn't in the list, fetch it so the label resolves
  useEffect(() => {
    if (!customerId) return
    if (clients.some((c) => c.id === customerId)) return

    getClientApi(customerId)
      .send()
      .then((res) => {
        if (res.data) {
          setClients((prev) =>
            prev.some((c) => c.id === res.data.id) ? prev : [res.data, ...prev],
          )
        }
      })
      .catch(() => {})
  }, [customerId, clients])

  const loadMore = useCallback(() => {
    if (loadingRef.current || !hasMore) return
    fetchPage(search, pageRef.current + 1, true)
  }, [hasMore, search, fetchPage])

  const options: SearchableSelectOption[] = useMemo(
    () => clients.map((c) => ({ id: c.id, label: `${c.firstname} ${c.lastname}` })),
    [clients],
  )

  return { options, search, setSearch, loading, hasMore, loadMore }
}
