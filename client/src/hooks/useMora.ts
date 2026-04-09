import { useQuery } from '@tanstack/react-query'
import { fetchMora } from '@/lib/api'
import type { MoraData } from '@/types/api'

export const MORA_QUERY_KEY = ['mora'] as const

export function useMora() {
  return useQuery<MoraData, Error>({
    queryKey: MORA_QUERY_KEY,
    queryFn: fetchMora,
    staleTime: 0,               // Siempre re-fetch al montar — data fresca en cada carga
    refetchOnWindowFocus: false, // Solo refresh manual — no polling accidental
    retry: 1,                   // Un reintento en error de red transitorio
  })
}
