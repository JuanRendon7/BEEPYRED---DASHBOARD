import axios from 'axios'
import type { MetricsData, InvoicesData, ClientsData, GrowthData } from '@/types/api'

// Axios instance — el baseURL es relativo porque Vite proxea /api/* a localhost:3001
const http = axios.create({
  baseURL: '/',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── fetchMetrics ──
// Llama GET /api/metrics y devuelve MetricsData (throws en error)
export async function fetchMetrics(): Promise<MetricsData> {
  const response = await http.get<{ success: boolean; data: MetricsData; error?: unknown }>('/api/metrics')

  if (!response.data.success) {
    const err = response.data as unknown as { error: { message: string } }
    throw new Error(err.error?.message ?? 'Error desconocido al obtener métricas')
  }

  return response.data.data
}

// ── fetchInvoices ──
// Llama GET /api/invoices y devuelve InvoicesData (throws en error)
export async function fetchInvoices(): Promise<InvoicesData> {
  const response = await http.get<{ success: boolean; data: InvoicesData; error?: unknown }>('/api/invoices')

  if (!response.data.success) {
    const err = response.data as unknown as { error: { message: string } }
    throw new Error(err.error?.message ?? 'Error desconocido al obtener facturas')
  }

  return response.data.data
}

// ── fetchClients ──
// Llama GET /api/clients y devuelve ClientsData (throws en error)
export async function fetchClients(): Promise<ClientsData> {
  const response = await http.get<{ success: boolean; data: ClientsData; error?: unknown }>('/api/clients')

  if (!response.data.success) {
    const err = response.data as unknown as { error: { message: string } }
    throw new Error(err.error?.message ?? 'Error desconocido al obtener clientes')
  }

  return response.data.data
}

// ── fetchGrowth ──
// Llama GET /api/growth y devuelve GrowthData (throws en error)
export async function fetchGrowth(): Promise<GrowthData> {
  const response = await http.get<{ success: boolean; data: GrowthData; error?: unknown }>('/api/growth')

  if (!response.data.success) {
    const err = response.data as unknown as { error: { message: string } }
    throw new Error(err.error?.message ?? 'Error desconocido al obtener datos de crecimiento')
  }

  return response.data.data
}
