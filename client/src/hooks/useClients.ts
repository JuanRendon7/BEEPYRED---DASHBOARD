import { useQuery } from '@tanstack/react-query'
import { fetchClients } from '@/lib/api'
import type { ClientsData } from '@/types/api'

export const CLIENTS_QUERY_KEY = ['clients'] as const

export function useClients() {
  return useQuery<ClientsData, Error>({
    queryKey: CLIENTS_QUERY_KEY,
    queryFn: fetchClients,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
