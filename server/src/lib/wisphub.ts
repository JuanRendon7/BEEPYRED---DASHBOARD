import axios from 'axios'

// Single authenticated Axios instance — token injected once, never exposed to clients
export const wisphubClient = axios.create({
  baseURL: process.env.WISPHUB_BASE_URL,
  headers: {
    'Authorization': `Api-Key ${process.env.WISPHUB_TOKEN}`,
    'Content-Type': 'application/json',
  },
  timeout: 15_000,
})

// Paginated list response shape (DRF convention — confirmed during Plan 02 exploration)
interface PagedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

/**
 * Exhausts all pages of a Wisphub paginated endpoint.
 * Max 300 records/page. Iterates until page.next is null.
 * Returns all results concatenated — caller never deals with pagination.
 */
export async function fetchAllPages<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<{ results: T[]; count: number }> {
  const allResults: T[] = []
  let offset = 0
  const limit = 300
  let totalCount = 0

  while (true) {
    const response = await wisphubClient.get<PagedResponse<T>>(endpoint, {
      params: { ...params, limit, offset },
    })
    const page = response.data
    totalCount = page.count
    allResults.push(...page.results)

    if (!page.next) break
    offset += limit
  }

  return { results: allResults, count: totalCount }
}
