import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { InstalledClientsData } from '@/types/api'

const BFF_BASE = import.meta.env.VITE_BFF_URL ?? 'http://localhost:3001'

async function fetchInstalledClients(): Promise<InstalledClientsData> {
  const { data } = await axios.get(`${BFF_BASE}/api/clients/installed-this-month`)
  if (!data.success) throw new Error(data.error?.message ?? 'Error fetching installed clients')
  return data.data as InstalledClientsData
}

export const INSTALLED_CLIENTS_QUERY_KEY = ['clients', 'installed-this-month'] as const

export function useInstalledClients() {
  return useQuery<InstalledClientsData, Error>({
    queryKey: INSTALLED_CLIENTS_QUERY_KEY,
    queryFn: fetchInstalledClients,
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
