import { useState, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'
import { useQueryClient, useIsFetching } from '@tanstack/react-query'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { METRICS_QUERY_KEY } from '@/hooks/useMetrics'
import { INVOICES_QUERY_KEY } from '@/hooks/useInvoices'

const COOLDOWN_MS = 30_000  // 30 segundos — rate limit protection

export function RefreshButton() {
  const queryClient = useQueryClient()
  const isFetching = useIsFetching()
  const [cooldownActive, setCooldownActive] = useState(false)

  const isDisabled = isFetching > 0 || cooldownActive
  const isLoading = isFetching > 0

  const handleRefresh = useCallback(async () => {
    if (isDisabled) return

    setCooldownActive(true)

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: METRICS_QUERY_KEY }),
      queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY }),
    ])

    setTimeout(() => {
      setCooldownActive(false)
    }, COOLDOWN_MS)
  }, [isDisabled, queryClient])

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      disabled={isDisabled}
      className={cn(
        'rounded-xl border-border bg-surface text-text-secondary',
        'hover:border-brand hover:text-brand',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'transition-colors duration-200',
      )}
      aria-label="Actualizar datos del dashboard"
    >
      <RefreshCw
        className={cn(
          'mr-2 h-4 w-4',
          isLoading && 'animate-spin',
        )}
        aria-hidden="true"
      />
      {isLoading ? 'Actualizando...' : cooldownActive ? 'Espera 30s' : 'Actualizar'}
    </Button>
  )
}
