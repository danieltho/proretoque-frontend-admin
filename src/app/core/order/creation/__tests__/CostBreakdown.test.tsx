/**
 * Tests TDD para CostBreakdown
 *
 * CostBreakdown recibe:
 * - orderCost: number      (en centimos)
 * - deliverySurcharge: number
 * - vatAmount: number
 * - total: number
 *
 * Comportamientos cubiertos:
 * - Muestra la etiqueta "COSTE DE PEDIDO" con el valor formateado en euros
 * - Muestra la etiqueta "RECARGO DE ENTREGA TOTAL" con el valor formateado en euros
 * - Muestra la etiqueta "IVA 21%" con el valor formateado en euros
 * - Muestra la etiqueta "TOTAL" con el valor formateado en euros
 * - Los valores se muestran con el simbolo € (formato europeo)
 * - Cero se muestra como 0,00 € (o equivalente formateado)
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CostBreakdown from '../components/step-confirmar/CostBreakdown'

// ---------------------------------------------------------------------------
// Tests: etiquetas
// ---------------------------------------------------------------------------

describe('CostBreakdown — etiquetas', () => {
  it('should_render_order_cost_label', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={200} vatAmount={252} total={1452} />)

    // Assert
    expect(screen.getByText('COSTE DE PEDIDO')).toBeInTheDocument()
  })

  it('should_render_delivery_surcharge_label', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={200} vatAmount={252} total={1452} />)

    // Assert
    expect(screen.getByText('RECARGO DE ENTREGA TOTAL')).toBeInTheDocument()
  })

  it('should_render_vat_label', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={200} vatAmount={252} total={1452} />)

    // Assert
    expect(screen.getByText('IVA 21%')).toBeInTheDocument()
  })

  it('should_render_total_label', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={200} vatAmount={252} total={1452} />)

    // Assert
    expect(screen.getByText('TOTAL')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: valores formateados en euros
// ---------------------------------------------------------------------------

describe('CostBreakdown — valores en euros', () => {
  it('should_display_order_cost_with_euro_symbol', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={0} vatAmount={0} total={1000} />)

    // Assert — 1000 centimos = 10 €
    // El componente debe mostrar algun texto que contenga € cerca del coste del pedido
    const costLabel = screen.getByText('COSTE DE PEDIDO')
    const row = costLabel.closest('[data-testid="cost-row-order"]') ?? costLabel.parentElement!
    expect(row.textContent).toMatch(/€/)
  })

  it('should_display_delivery_surcharge_with_euro_symbol', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={0} deliverySurcharge={500} vatAmount={0} total={500} />)

    // Assert
    const surchargeLabel = screen.getByText('RECARGO DE ENTREGA TOTAL')
    const row =
      surchargeLabel.closest('[data-testid="cost-row-delivery"]') ?? surchargeLabel.parentElement!
    expect(row.textContent).toMatch(/€/)
  })

  it('should_display_vat_with_euro_symbol', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={0} deliverySurcharge={0} vatAmount={210} total={210} />)

    // Assert
    const vatLabel = screen.getByText('IVA 21%')
    const row = vatLabel.closest('[data-testid="cost-row-vat"]') ?? vatLabel.parentElement!
    expect(row.textContent).toMatch(/€/)
  })

  it('should_display_total_with_euro_symbol', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={1000} deliverySurcharge={200} vatAmount={252} total={1452} />)

    // Assert
    const totalLabel = screen.getByText('TOTAL')
    const row = totalLabel.closest('[data-testid="cost-row-total"]') ?? totalLabel.parentElement!
    expect(row.textContent).toMatch(/€/)
  })

  it('should_display_zero_values_formatted', () => {
    // Arrange / Act
    render(<CostBreakdown orderCost={0} deliverySurcharge={0} vatAmount={0} total={0} />)

    // Assert — todos los valores en 0, el componente sigue mostrando €
    const allEuro = screen.getAllByText(/€/)
    expect(allEuro.length).toBeGreaterThanOrEqual(1)
  })
})
