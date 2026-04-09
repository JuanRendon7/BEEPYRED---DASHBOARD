import { useQuery } from '@tanstack/react-query'
import { fetchInversion } from '@/lib/api'
import type { InversionData } from '@/types/api'

export const INVERSION_QUERY_KEY = ['inversion'] as const

export function useInversion() {
  return useQuery<InversionData, Error>({
    queryKey: INVERSION_QUERY_KEY,
    queryFn: fetchInversion,
    staleTime: 0,
    refetchOnWindowFocus: false,
    refetchInterval: 5 * 60 * 1000,  // auto-refresh cada 5 min
    retry: 1,
  })
}
