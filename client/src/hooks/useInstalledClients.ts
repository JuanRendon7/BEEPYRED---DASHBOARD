import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import type { InstalledClientsData } from '@/types/api'
import { TOKEN_KEY } from '@/contexts/AuthContext'

async function fetchInstalledClients(): Promise<InstalledClientsData> {
  const token = localStorage.getItem(TOKEN_KEY)
  const { data } = await axios.get('/api/clients/installed-this-month', {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
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
