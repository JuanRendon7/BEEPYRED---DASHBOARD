import { useQuery } from '@tanstack/react-query'
import { fetchZones } from '@/lib/api'
import type { ZonesData } from '@/types/api'

export const ZONES_QUERY_KEY = ['zones'] as const

export function useZones() {
  return useQuery<ZonesData, Error>({
    queryKey: ZONES_QUERY_KEY,
    queryFn: fetchZones,
    staleTime: 0,               // Siempre re-fetch al montar — data fresca en cada carga
    refetchOnWindowFocus: false, // Solo refresh manual — no polling accidental
    retry: 1,                   // Un reintento en error de red transitorio
  })
}
