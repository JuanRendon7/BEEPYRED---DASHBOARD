import { useQuery } from '@tanstack/react-query'
import { fetchPlans } from '@/lib/api'
import type { PlansData } from '@/types/api'

export const PLANS_QUERY_KEY = ['plans'] as const

export function usePlans() {
  return useQuery<PlansData, Error>({
    queryKey: PLANS_QUERY_KEY,
    queryFn: fetchPlans,
    staleTime: 0,               // Siempre re-fetch al montar — data fresca en cada carga
    refetchOnWindowFocus: false, // Solo refresh manual — no polling accidental
    retry: 1,                   // Un reintento en error de red transitorio
  })
}
