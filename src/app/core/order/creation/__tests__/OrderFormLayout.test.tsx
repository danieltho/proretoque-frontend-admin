/**
 * Tests TDD para OrderFormLayout — issue #19
 *
 * Cubre el comportamiento del boton "Siguiente" segun canAdvanceFromCurrentStep.
 *
 * Dependencias mockeadas:
 * - useOrderForm — para controlar canAdvanceFromCurrentStep de forma directa
 * - react-router-dom useNavigate — evita navegacion real en jsdom
 * - BatchNameDialog — componente con Radix que no es relevante para estos tests
 * - OrderStepper — componente que no es relevante para estos tests
 */

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// ---------------------------------------------------------------------------
// Mocks de modulos — deben declararse antes de cualquier import del modulo real
// ---------------------------------------------------------------------------

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => vi.fn() }
})

// Mocks de subcomponentes que no necesitamos ejercitar aqui
vi.mock('../components/BatchNameDialog', () => ({
  default: () => null,
}))

vi.mock('../components/OrderStepper', () => ({
  default: () => <div data-testid="order-stepper" />,
}))

import { useOrderForm } from '../context/OrderFormContext'
import OrderFormLayout from '../components/OrderFormLayout'

// ---------------------------------------------------------------------------
// Tipo del valor de contexto (shape minima requerida por OrderFormLayout)
// ---------------------------------------------------------------------------

type ContextShape = ReturnType<typeof useOrderForm>

function makeContextValue(overrides: Partial<ContextShape> = {}): ContextShape {
  return {
    categories: [],
    batches: [],
    activeBatchId: '',
    setActiveBatchId: vi.fn(),
    activeBatch: undefined,
    batchCount: 1,
    totalFiles: 0,
    validationErrors: [],
    addBatch: vi.fn(),
    removeBatch: vi.fn(),
    renameBatch: vi.fn(),
    handleFiles: vi.fn(),
    removeFile: vi.fn(),
    handleItemSelect: vi.fn(),
    clearBatchProducts: vi.fn(),
    updateDeliveryOptions: vi.fn(),
    applyDeliveryToAll: vi.fn(),
    orderName: '',
    setOrderName: vi.fn(),
    activeStep: 1,
    goStep: vi.fn(),
    activeCategoryId: null,
    setSelectedCategoryId: vi.fn(),
    editingBatch: null,
    setEditingBatch: vi.fn(),
    viewMode: 'list' as const,
    setViewMode: vi.fn(),
    submitting: false,
    canSubmit: false,
    handleSubmit: vi.fn(),
    blocker: { state: 'unblocked' as const, reset: undefined, proceed: undefined },
    // canAdvanceFromCurrentStep es el campo NUEVO del issue #19
    // TypeScript aun no lo conoce — lo casteamos con unknown para el Red phase
    ...(overrides as object),
  } as unknown as ContextShape
}

function renderLayout(
  overrides: Partial<ContextShape> & { canAdvanceFromCurrentStep?: boolean } = {},
) {
  vi.mocked(useOrderForm).mockReturnValue(makeContextValue(overrides))
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <OrderFormLayout>
        <div>contenido del step</div>
      </OrderFormLayout>
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Tests: boton "Siguiente" deshabilitado segun canAdvanceFromCurrentStep
// ---------------------------------------------------------------------------

describe('OrderFormLayout — boton Siguiente (issue #19)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should_disable_siguiente_button_when_canAdvanceFromCurrentStep_is_false', () => {
    // Arrange & Act
    // Step 1, sin archivos => canAdvanceFromCurrentStep: false
    renderLayout({ activeStep: 1, canAdvanceFromCurrentStep: false })

    // Assert — el boton "Siguiente" debe estar deshabilitado
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    expect(nextButton).toBeDisabled()
  })

  it('should_enable_siguiente_button_when_canAdvanceFromCurrentStep_is_true', () => {
    // Arrange & Act
    // Step 1, con archivos => canAdvanceFromCurrentStep: true
    renderLayout({ activeStep: 1, canAdvanceFromCurrentStep: true })

    // Assert — el boton "Siguiente" debe estar habilitado
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    expect(nextButton).not.toBeDisabled()
  })

  it('should_show_siguiente_button_enabled_in_step2_when_canAdvanceFromCurrentStep_is_true', () => {
    // Arrange & Act — step 2 siempre tiene canAdvanceFromCurrentStep true
    renderLayout({ activeStep: 2, canAdvanceFromCurrentStep: true })

    // Assert — boton "Siguiente" presente y habilitado
    const nextButton = screen.getByRole('button', { name: /siguiente/i })
    expect(nextButton).toBeInTheDocument()
    expect(nextButton).not.toBeDisabled()
  })
})
