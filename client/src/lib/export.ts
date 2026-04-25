import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const BRAND_COLOR: [number, number, number] = [245, 168, 0]
const HEADER_TEXT: [number, number, number] = [20, 20, 20]
const ALT_ROW: [number, number, number] = [30, 30, 35]
const WHITE: [number, number, number] = [255, 255, 255]

// ── Excel ──────────────────────────────────────────────────────────────────
export function exportToExcel(
  rows: Record<string, unknown>[],
  filename: string,
  sheetName = 'Datos'
) {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`)
}

export function exportToExcelMultiSheet(
  sheets: { name: string; rows: Record<string, unknown>[] }[],
  filename: string
) {
  const wb = XLSX.utils.book_new()
  for (const sheet of sheets) {
    const ws = XLSX.utils.json_to_sheet(sheet.rows)
    XLSX.utils.book_append_sheet(wb, ws, sheet.name)
  }
  const date = new Date().toISOString().split('T')[0]
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`)
}

// ── PDF ────────────────────────────────────────────────────────────────────
export interface PDFColumn {
  header: string
  dataKey: string
}

function pdfHeader(doc: jsPDF, title: string) {
  const date = new Date().toLocaleDateString('es-CO', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  })
  doc.setFontSize(14)
  doc.setTextColor(245, 168, 0)
  doc.text('BEEPYRED ISP GROUP SAS', 14, 16)
  doc.setFontSize(11)
  doc.setTextColor(220, 220, 220)
  doc.text(title, 14, 24)
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`Generado: ${date}`, 14, 30)
}

export function exportToPDF(
  title: string,
  columns: PDFColumn[],
  rows: Record<string, unknown>[],
  filename: string,
  orientation: 'portrait' | 'landscape' = 'portrait'
) {
  const doc = new jsPDF({ orientation })
  pdfHeader(doc, title)

  autoTable(doc, {
    columns,
    body: rows as never[],
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 3,
      textColor: WHITE,
      fillColor: [24, 24, 27],
    },
    headStyles: {
      fillColor: BRAND_COLOR,
      textColor: HEADER_TEXT,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: ALT_ROW,
    },
    tableLineColor: [39, 39, 42],
    tableLineWidth: 0.1,
  })

  const date = new Date().toISOString().split('T')[0]
  doc.save(`${filename}_${date}.pdf`)
}

export function exportToPDFMultiSection(
  title: string,
  sections: {
    subtitle: string
    columns: PDFColumn[]
    rows: Record<string, unknown>[]
  }[],
  filename: string,
  orientation: 'portrait' | 'landscape' = 'landscape'
) {
  const doc = new jsPDF({ orientation })
  pdfHeader(doc, title)

  let currentY = 35
  for (const section of sections) {
    doc.setFontSize(9)
    doc.setTextColor(160, 160, 160)
    doc.text(section.subtitle.toUpperCase(), 14, currentY)
    currentY += 4

    autoTable(doc, {
      columns: section.columns,
      body: section.rows as never[],
      startY: currentY,
      styles: {
        fontSize: 8,
        cellPadding: 3,
        textColor: WHITE,
        fillColor: [24, 24, 27],
      },
      headStyles: {
        fillColor: BRAND_COLOR,
        textColor: HEADER_TEXT,
        fontStyle: 'bold',
        fontSize: 8,
      },
      alternateRowStyles: { fillColor: ALT_ROW },
      tableLineColor: [39, 39, 42],
      tableLineWidth: 0.1,
      didDrawPage: (data) => {
        currentY = (data.cursor?.y ?? currentY) + 10
      },
    })
    currentY += 10
  }

  const date = new Date().toISOString().split('T')[0]
  doc.save(`${filename}_${date}.pdf`)
}
