/**
 * Tests TDD para OrderConfirmSummaryTable
 *
 * OrderConfirmSummaryTable recibe:
 * - rows: BatchSummaryRow[]  { id, name, fileCount, deliveryTime, format }
 * - totalFiles: number
 *
 * Comportamientos cubiertos:
 * - Muestra las columnas: Nombre, Fotos, Entrega, Formato
 * - Muestra una fila por cada batch con name, fileCount, deliveryTime y format
 * - Muestra "N° total de fotos" con el totalFiles correspondiente
 * - Con tabla vacia (sin filas) el encabezado y el total siguen visibles
 */

import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import OrderConfirmSummaryTable from '../components/step-confirmar/OrderConfirmSummaryTable'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface BatchSummaryRow {
  id: string
  name: string
  fileCount: number
  deliveryTime: string
  format: string
}

function buildRow(overrides: Partial<BatchSummaryRow> = {}): BatchSummaryRow {
  return {
    id: overrides.id ?? 'batch-1',
    name: overrides.name ?? 'Lote 1',
    fileCount: overrides.fileCount ?? 5,
    deliveryTime: overrides.deliveryTime ?? '72hs',
    format: overrides.format ?? 'PSD',
  }
}

// ---------------------------------------------------------------------------
// Tests: columnas del encabezado
// ---------------------------------------------------------------------------

describe('OrderConfirmSummaryTable — columnas', () => {
  it('should_render_nombre_column_header', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert
    expect(screen.getByText('Nombre')).toBeInTheDocument()
  })

  it('should_render_fotos_column_header', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert
    expect(screen.getByText('Fotos')).toBeInTheDocument()
  })

  it('should_render_entrega_column_header', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert
    expect(screen.getByText('Entrega')).toBeInTheDocument()
  })

  it('should_render_formato_column_header', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert
    expect(screen.getByText('Formato')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: filas de datos
// ---------------------------------------------------------------------------

describe('OrderConfirmSummaryTable — filas', () => {
  it('should_render_one_row_per_batch', () => {
    // Arrange
    const rows = [buildRow({ id: 'b1', name: 'Lote A' }), buildRow({ id: 'b2', name: 'Lote B' })]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={10} />)

    // Assert
    expect(screen.getByText('Lote A')).toBeInTheDocument()
    expect(screen.getByText('Lote B')).toBeInTheDocument()
  })

  it('should_render_file_count_in_batch_row', () => {
    // Arrange
    const rows = [buildRow({ name: 'Lote 1', fileCount: 8 })]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={8} />)

    // Assert — el numero de fotos aparece en la fila
    expect(screen.getByText('8')).toBeInTheDocument()
  })

  it('should_render_delivery_time_in_batch_row', () => {
    // Arrange
    const rows = [buildRow({ name: 'Lote 1', deliveryTime: '24hs' })]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={5} />)

    // Assert — el tiempo de entrega aparece en la fila
    expect(screen.getByText('24hs')).toBeInTheDocument()
  })

  it('should_render_format_in_batch_row', () => {
    // Arrange
    const rows = [buildRow({ name: 'Lote 1', format: 'TIFF' })]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={5} />)

    // Assert
    expect(screen.getByText('TIFF')).toBeInTheDocument()
  })

  it('should_render_all_batch_data_correctly_in_same_row', () => {
    // Arrange
    const rows = [
      buildRow({
        id: 'b1',
        name: 'Sesion Boda',
        fileCount: 12,
        deliveryTime: '48hs',
        format: 'PSD',
      }),
    ]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={12} />)

    // Assert — todos los datos estan presentes
    expect(screen.getByText('Sesion Boda')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('48hs')).toBeInTheDocument()
    expect(screen.getByText('PSD')).toBeInTheDocument()
  })

  it('should_render_multiple_rows_with_correct_data', () => {
    // Arrange
    const rows = [
      buildRow({ id: 'b1', name: 'Lote A', fileCount: 3, format: 'JPG' }),
      buildRow({ id: 'b2', name: 'Lote B', fileCount: 7, format: 'PNG' }),
    ]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={10} />)

    // Assert
    const table = screen.getByRole('table')
    expect(within(table).getByText('Lote A')).toBeInTheDocument()
    expect(within(table).getByText('Lote B')).toBeInTheDocument()
    expect(within(table).getByText('JPG')).toBeInTheDocument()
    expect(within(table).getByText('PNG')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: total de fotos
// ---------------------------------------------------------------------------

describe('OrderConfirmSummaryTable — total de fotos', () => {
  it('should_render_total_files_label', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert — el texto "N° total de fotos" o similar debe estar presente
    expect(screen.getByText(/total de fotos/i)).toBeInTheDocument()
  })

  it('should_render_correct_total_files_count', () => {
    // Arrange
    const rows = [buildRow({ id: 'b1', fileCount: 5 }), buildRow({ id: 'b2', fileCount: 10 })]

    // Act
    render(<OrderConfirmSummaryTable rows={rows} totalFiles={15} />)

    // Assert — el total de fotos coincide con totalFiles prop
    const totalSection =
      screen.getByText(/total de fotos/i).closest('tr') ??
      screen.getByText(/total de fotos/i).parentElement!
    expect(totalSection.textContent).toContain('15')
  })

  it('should_render_zero_total_files_when_no_rows', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert
    const totalSection =
      screen.getByText(/total de fotos/i).closest('tr') ??
      screen.getByText(/total de fotos/i).parentElement!
    expect(totalSection.textContent).toContain('0')
  })
})

// ---------------------------------------------------------------------------
// Tests: tabla vacia
// ---------------------------------------------------------------------------

describe('OrderConfirmSummaryTable — tabla vacia', () => {
  it('should_render_table_with_headers_when_no_rows', () => {
    // Arrange / Act
    render(<OrderConfirmSummaryTable rows={[]} totalFiles={0} />)

    // Assert — encabezados visibles aunque no haya filas
    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Fotos')).toBeInTheDocument()
    expect(screen.getByText('Entrega')).toBeInTheDocument()
    expect(screen.getByText('Formato')).toBeInTheDocument()
  })
})
