import { useQuery } from '@tanstack/react-query'
import { fetchInvoices } from '@/lib/api'
import type { InvoicesData } from '@/types/api'

export const INVOICES_QUERY_KEY = ['invoices'] as const

export function useInvoices() {
  return useQuery<InvoicesData, Error>({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: fetchInvoices,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
