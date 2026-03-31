/**
 * Tests TDD — BatchCreatePage (fase RED)
 *
 * BatchCreatePage es el componente container que orquesta el flujo de 2 pasos
 * usando useBatchCreate. Renderiza:
 *   - Paso 1: <BatchCreateStepUpload /> con la zona de subida
 *   - Paso 2: <BatchCreateStepProducts /> con selector de protocolos
 *
 * El hook useBatchCreate se mockea a nivel de módulo para aislar el componente.
 * BatchCreateStepUpload y BatchCreateStepProducts también se mockean para
 * aislar BatchCreatePage de sus dependencias internas.
 *
 * Comportamientos cubiertos:
 *   - Renderiza el paso 1 (zona upload) en el estado inicial
 *   - Botón "Siguiente" disabled cuando canGoNext=false
 *   - Botón "Siguiente" enabled cuando canGoNext=true
 *   - Al hacer click "Siguiente" con canGoNext=true, llama goToStep(2)
 *   - Cuando currentStep=2, renderiza el paso 2 (selector protocolos)
 *   - Botón "Volver" en paso 2 llama goToStep(1)
 *   - Botón "Crear lote" en paso 2 llama submit
 *   - Botón "Crear lote" disabled cuando submitting=true
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import BatchCreatePage from '../pages/BatchCreatePage'

// ---------------------------------------------------------------------------
// Mock del hook orquestador
// ---------------------------------------------------------------------------

vi.mock('../hooks/useBatchCreate', () => ({
  useBatchCreate: vi.fn(),
}))

import { useBatchCreate } from '../hooks/useBatchCreate'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos para aislar BatchCreatePage
// ---------------------------------------------------------------------------

vi.mock('../components/BatchCreateStepUpload', () => ({
  default: (props: {
    canGoNext: boolean
    onNext: () => void
    onBack: () => void
    files: File[]
    previews: string[]
    onFilesChange: (files: FileList | null) => void
    onRemoveFile: (index: number) => void
  }) => (
    <div data-testid="step-upload">
      <span data-testid="step-upload-can-go-next">{String(props.canGoNext)}</span>
      <button data-testid="step-upload-next-btn" onClick={props.onNext} disabled={!props.canGoNext}>
        Siguiente
      </button>
      <button data-testid="step-upload-back-btn" onClick={props.onBack}>
        Cancelar
      </button>
    </div>
  ),
}))

vi.mock('../components/BatchCreateStepProducts', () => ({
  default: (props: { onBack: () => void; onSubmit: () => void; submitting: boolean }) => (
    <div data-testid="step-products">
      <button data-testid="step-products-back-btn" onClick={props.onBack}>
        Volver
      </button>
      <button
        data-testid="step-products-submit-btn"
        onClick={props.onSubmit}
        disabled={props.submitting}
      >
        Crear lote
      </button>
    </div>
  ),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDefaultHook(overrides: Partial<ReturnType<typeof useBatchCreate>> = {}) {
  return {
    currentStep: 1 as 1 | 2,
    goToStep: vi.fn(),
    files: [],
    previews: [],
    handleFiles: vi.fn(),
    removeFile: vi.fn(),
    categories: [],
    categoryGroups: [],
    activeCategoryId: null,
    setActiveCategoryId: vi.fn(),
    selectedProducts: {},
    handleItemSelect: vi.fn(),
    clearProducts: vi.fn(),
    submit: vi.fn(),
    submitting: false,
    canGoNext: false,
    ...overrides,
  }
}

function renderPage(orderId?: string) {
  const route = orderId ? `/orders/${orderId}/batches/new` : '/batches/new'
  return render(
    <MemoryRouter initialEntries={[route]}>
      <BatchCreatePage />
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Paso 1 — estado inicial
// ---------------------------------------------------------------------------

describe('BatchCreatePage — paso 1 (estado inicial)', () => {
  it('should_render_step_upload_on_initial_mount', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(buildDefaultHook())

    // Act
    renderPage()

    // Assert — se muestra el paso 1
    expect(screen.getByTestId('step-upload')).toBeInTheDocument()
    expect(screen.queryByTestId('step-products')).not.toBeInTheDocument()
  })

  it('should_render_next_button_disabled_when_canGoNext_is_false', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(buildDefaultHook({ canGoNext: false }))

    // Act
    renderPage()

    // Assert — botón Siguiente deshabilitado
    expect(screen.getByTestId('step-upload-next-btn')).toBeDisabled()
  })

  it('should_render_next_button_enabled_when_canGoNext_is_true', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(buildDefaultHook({ canGoNext: true }))

    // Act
    renderPage()

    // Assert — botón Siguiente habilitado
    expect(screen.getByTestId('step-upload-next-btn')).not.toBeDisabled()
  })

  it('should_call_goToStep_2_when_next_button_clicked_with_canGoNext_true', async () => {
    // Arrange
    const user = userEvent.setup()
    const goToStep = vi.fn()
    vi.mocked(useBatchCreate).mockReturnValue(buildDefaultHook({ canGoNext: true, goToStep }))
    renderPage()

    // Act
    await user.click(screen.getByTestId('step-upload-next-btn'))

    // Assert
    expect(goToStep).toHaveBeenCalledWith(2)
  })
})

// ---------------------------------------------------------------------------
// Tests: Paso 2 — selector de protocolos
// ---------------------------------------------------------------------------

describe('BatchCreatePage — paso 2 (protocolos)', () => {
  it('should_render_step_products_when_currentStep_is_2', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(buildDefaultHook({ currentStep: 2, canGoNext: true }))

    // Act
    renderPage()

    // Assert — se muestra el paso 2 y no el paso 1
    expect(screen.getByTestId('step-products')).toBeInTheDocument()
    expect(screen.queryByTestId('step-upload')).not.toBeInTheDocument()
  })

  it('should_call_goToStep_1_when_back_button_clicked_on_step_2', async () => {
    // Arrange
    const user = userEvent.setup()
    const goToStep = vi.fn()
    vi.mocked(useBatchCreate).mockReturnValue(
      buildDefaultHook({ currentStep: 2, canGoNext: true, goToStep }),
    )
    renderPage()

    // Act
    await user.click(screen.getByTestId('step-products-back-btn'))

    // Assert
    expect(goToStep).toHaveBeenCalledWith(1)
  })

  it('should_call_submit_when_crear_lote_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const submit = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useBatchCreate).mockReturnValue(
      buildDefaultHook({ currentStep: 2, canGoNext: true, submit }),
    )
    renderPage()

    // Act
    await user.click(screen.getByTestId('step-products-submit-btn'))

    // Assert
    expect(submit).toHaveBeenCalledTimes(1)
  })

  it('should_render_crear_lote_button_disabled_when_submitting_is_true', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(
      buildDefaultHook({ currentStep: 2, canGoNext: true, submitting: true }),
    )

    // Act
    renderPage()

    // Assert — botón deshabilitado durante el submit
    expect(screen.getByTestId('step-products-submit-btn')).toBeDisabled()
  })

  it('should_render_crear_lote_button_enabled_when_submitting_is_false', () => {
    // Arrange
    vi.mocked(useBatchCreate).mockReturnValue(
      buildDefaultHook({ currentStep: 2, canGoNext: true, submitting: false }),
    )

    // Act
    renderPage()

    // Assert
    expect(screen.getByTestId('step-products-submit-btn')).not.toBeDisabled()
  })
})
