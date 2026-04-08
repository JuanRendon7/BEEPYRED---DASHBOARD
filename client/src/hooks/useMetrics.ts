import { useQuery } from '@tanstack/react-query'
import { fetchMetrics } from '@/lib/api'
import type { MetricsData } from '@/types/api'

export const METRICS_QUERY_KEY = ['metrics'] as const

export function useMetrics() {
  return useQuery<MetricsData, Error>({
    queryKey: METRICS_QUERY_KEY,
    queryFn: fetchMetrics,
    staleTime: 0,               // Siempre re-fetch al montar — data fresca en cada carga
    refetchOnWindowFocus: false, // Solo refresh manual — no polling accidental
    retry: 1,                   // Un reintento en error de red transitorio
  })
}
