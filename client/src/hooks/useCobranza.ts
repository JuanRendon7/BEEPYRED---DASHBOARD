import { useQuery } from '@tanstack/react-query'
import { fetchCobranza } from '@/lib/api'
import type { CobranzaData } from '@/types/api'

export const COBRANZA_QUERY_KEY = ['cobranza'] as const

export function useCobranza() {
  return useQuery<CobranzaData, Error>({
    queryKey: COBRANZA_QUERY_KEY,
    queryFn: fetchCobranza,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
