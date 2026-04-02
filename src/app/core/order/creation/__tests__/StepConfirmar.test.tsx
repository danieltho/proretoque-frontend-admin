/**
 * Tests TDD para StepConfirmar (container — Step 4 del flujo de creacion)
 *
 * StepConfirmar es un container que consume useOrderForm() y coordina:
 * - PaymentMethodSelector (selector de metodos de pago con checkbox de terminos)
 * - OrderConfirmSummaryTable (tabla de resumen de lotes)
 * - CouponSection (seccion de cupon de descuento)
 * - CostBreakdown (desglose de costes)
 *
 * Estado local de StepConfirmar:
 * - termsAccepted: boolean  — se gestiona internamente, empieza en false
 * - couponCode: string      — se gestiona internamente, empieza en ''
 *
 * Comportamientos cubiertos:
 * - Muestra el selector de metodos de pago
 * - Muestra la tabla de resumen de pedidos con los lotes del contexto
 * - Inicialmente los botones de pago estan deshabilitados (terms no aceptados)
 * - Al aceptar los terminos, los botones de pago se habilitan
 * - Al hacer click en "PAGAR" llama handleSubmit del contexto
 * - Muestra la seccion de cupon
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StepConfirmar from '../components/step-confirmar/StepConfirmar'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

import { useOrderForm } from '../context/OrderFormContext'

// ---------------------------------------------------------------------------
// Mocks de sub-componentes para aislar StepConfirmar
// ---------------------------------------------------------------------------

vi.mock('../components/step-confirmar/PaymentMethodSelector', () => ({
  default: (props: {
    termsAccepted: boolean
    submitting: boolean
    onTermsChange: (v: boolean) => void
    onPay: (method: string) => void
  }) => (
    <div data-testid="payment-method-selector">
      <input
        type="checkbox"
        aria-label="terminos"
        checked={props.termsAccepted}
        onChange={(e) => props.onTermsChange(e.target.checked)}
        readOnly={false}
      />
      <button
        disabled={!props.termsAccepted || props.submitting}
        onClick={() => props.onPay('credit-card')}
      >
        PAGAR
      </button>
    </div>
  ),
}))

vi.mock('../components/step-confirmar/OrderConfirmSummaryTable', () => ({
  default: (props: { rows: unknown[]; totalFiles: number }) => (
    <div
      data-testid="order-confirm-summary-table"
      data-rows={props.rows.length}
      data-total={props.totalFiles}
    >
      OrderConfirmSummaryTable
    </div>
  ),
}))

vi.mock('../components/step-confirmar/CouponSection', () => ({
  default: () => <div data-testid="coupon-section">CouponSection</div>,
}))

vi.mock('../components/step-confirmar/CostBreakdown', () => ({
  default: () => <div data-testid="cost-breakdown">CostBreakdown</div>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockHandleSubmit = vi.fn()

function mockContext(overrides: {
  batches?: Array<{
    id: string
    name: string
    files: File[]
    deliveryOptions: { deliveryTime: string; format: string }
    products: Record<string, unknown>
    previews: string[]
  }>
  totalFiles?: number
  canSubmit?: boolean
  submitting?: boolean
  handleSubmit?: () => Promise<void>
}) {
  vi.mocked(useOrderForm).mockReturnValue({
    batches: overrides.batches ?? [
      {
        id: 'batch-1',
        name: 'Lote 1',
        files: [new File([''], 'photo1.jpg'), new File([''], 'photo2.jpg')],
        deliveryOptions: { deliveryTime: '72hs', format: 'PSD' },
        products: {},
        previews: [],
      },
    ],
    totalFiles: overrides.totalFiles ?? 2,
    canSubmit: overrides.canSubmit ?? true,
    submitting: overrides.submitting ?? false,
    handleSubmit: overrides.handleSubmit ?? mockHandleSubmit,
  } as ReturnType<typeof useOrderForm>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: renderizado de sub-componentes
// ---------------------------------------------------------------------------

describe('StepConfirmar — renderizado de sub-componentes', () => {
  it('should_render_payment_method_selector', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepConfirmar />)

    // Assert
    expect(screen.getByTestId('payment-method-selector')).toBeInTheDocument()
  })

  it('should_render_order_confirm_summary_table', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepConfirmar />)

    // Assert
    expect(screen.getByTestId('order-confirm-summary-table')).toBeInTheDocument()
  })

  it('should_render_coupon_section', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepConfirmar />)

    // Assert
    expect(screen.getByTestId('coupon-section')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: tabla de resumen — datos del contexto
// ---------------------------------------------------------------------------

describe('StepConfirmar — datos de lotes en la tabla', () => {
  it('should_pass_correct_rows_count_to_summary_table', () => {
    // Arrange
    mockContext({
      batches: [
        {
          id: 'b1',
          name: 'Lote A',
          files: [new File([''], 'a.jpg')],
          deliveryOptions: { deliveryTime: '24hs', format: 'JPG' },
          products: {},
          previews: [],
        },
        {
          id: 'b2',
          name: 'Lote B',
          files: [new File([''], 'b.jpg'), new File([''], 'c.jpg')],
          deliveryOptions: { deliveryTime: '48hs', format: 'PSD' },
          products: {},
          previews: [],
        },
      ],
      totalFiles: 3,
    })

    // Act
    render(<StepConfirmar />)

    // Assert — la tabla recibe 2 filas (una por batch)
    const table = screen.getByTestId('order-confirm-summary-table')
    expect(table).toHaveAttribute('data-rows', '2')
  })

  it('should_pass_total_files_to_summary_table', () => {
    // Arrange
    mockContext({ totalFiles: 7 })

    // Act
    render(<StepConfirmar />)

    // Assert
    const table = screen.getByTestId('order-confirm-summary-table')
    expect(table).toHaveAttribute('data-total', '7')
  })
})

// ---------------------------------------------------------------------------
// Tests: gestion de terminos (estado local)
// ---------------------------------------------------------------------------

describe('StepConfirmar — gestion de terminos', () => {
  it('should_initially_have_pay_buttons_disabled_because_terms_not_accepted', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepConfirmar />)

    // Assert — el boton del mock esta deshabilitado porque termsAccepted=false
    expect(screen.getByRole('button', { name: 'PAGAR' })).toBeDisabled()
  })

  it('should_enable_pay_buttons_after_accepting_terms', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({})
    render(<StepConfirmar />)

    // Act — marcar el checkbox de terminos
    await user.click(screen.getByRole('checkbox', { name: 'terminos' }))

    // Assert — el boton de pago se habilita
    expect(screen.getByRole('button', { name: 'PAGAR' })).not.toBeDisabled()
  })

  it('should_disable_pay_buttons_again_when_terms_unchecked', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({})
    render(<StepConfirmar />)

    // Act — marcar y desmarcar
    await user.click(screen.getByRole('checkbox', { name: 'terminos' }))
    await user.click(screen.getByRole('checkbox', { name: 'terminos' }))

    // Assert — vuelve a estar deshabilitado
    expect(screen.getByRole('button', { name: 'PAGAR' })).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests: llamada a handleSubmit
// ---------------------------------------------------------------------------

describe('StepConfirmar — llamada a handleSubmit', () => {
  it('should_call_handleSubmit_from_context_when_pay_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    mockContext({ handleSubmit })
    render(<StepConfirmar />)

    // Act — aceptar terminos y luego pagar
    await user.click(screen.getByRole('checkbox', { name: 'terminos' }))
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_handleSubmit_when_terms_not_accepted', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    mockContext({ handleSubmit })
    render(<StepConfirmar />)

    // Act — intentar pagar sin aceptar terminos (boton deshabilitado)
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: estado submitting
// ---------------------------------------------------------------------------

describe('StepConfirmar — estado submitting', () => {
  it('should_disable_pay_button_when_submitting_even_if_terms_accepted', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({ submitting: true })
    render(<StepConfirmar />)

    // Act — aceptar terminos (pero submitting=true)
    await user.click(screen.getByRole('checkbox', { name: 'terminos' }))

    // Assert — el boton sigue deshabilitado por submitting
    expect(screen.getByRole('button', { name: 'PAGAR' })).toBeDisabled()
  })
})
