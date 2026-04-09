import { FileSpreadsheet, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportButtonsProps {
  onExcel: () => void
  onPDF: () => void
  disabled?: boolean
  className?: string
}

export function ExportButtons({ onExcel, onPDF, disabled, className }: ExportButtonsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <button
        onClick={onExcel}
        disabled={disabled}
        title="Exportar Excel"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-text-muted hover:text-green-400 hover:bg-green-400/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FileSpreadsheet className="h-3.5 w-3.5" />
        XLS
      </button>
      <button
        onClick={onPDF}
        disabled={disabled}
        title="Exportar PDF"
        className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-medium text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <FileText className="h-3.5 w-3.5" />
        PDF
      </button>
    </div>
  )
}
