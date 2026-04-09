import { useQuery } from '@tanstack/react-query'
import { fetchAntiguedad } from '@/lib/api'
import type { AntiguedadData } from '@/types/api'

export const ANTIGUEDAD_QUERY_KEY = ['antiguedad'] as const

export function useAntiguedad() {
  return useQuery<AntiguedadData, Error>({
    queryKey: ANTIGUEDAD_QUERY_KEY,
    queryFn: fetchAntiguedad,
    staleTime: 0,               // Siempre re-fetch al montar — data fresca en cada carga
    refetchOnWindowFocus: false, // Solo refresh manual — no polling accidental
    retry: 1,                   // Un reintento en error de red transitorio
  })
}
