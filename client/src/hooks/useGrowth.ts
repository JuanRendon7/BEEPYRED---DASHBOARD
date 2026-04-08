import { useQuery } from '@tanstack/react-query'
import { fetchGrowth } from '@/lib/api'
import type { GrowthData } from '@/types/api'

export const GROWTH_QUERY_KEY = ['growth'] as const

export function useGrowth() {
  return useQuery<GrowthData, Error>({
    queryKey: GROWTH_QUERY_KEY,
    queryFn: fetchGrowth,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
