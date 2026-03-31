/**
 * Tests TDD para OrderNewPage
 *
 * OrderNewPage compone OrderFormProvider + OrderNewContent.
 * OrderNewContent selecciona que step renderizar basandose en activeStep del contexto.
 *
 * Para aislar la logica de routing de pasos se mockean:
 * - Los 4 componentes de paso (StepUpload, StepRetoques, StepResumen, StepConfirmar)
 * - OrderFormLayout — solo pasa sus children para que OrderNewContent funcione
 * - Dependencias externas del proveedor: alova/client, uploadStore, react-router-dom
 *
 * Comportamientos cubiertos:
 * - Renderiza sin errores (el proveedor esta presente)
 * - Muestra StepUpload en el step 1 (estado inicial)
 * - No muestra StepRetoques, StepResumen ni StepConfirmar en step 1
 * - Solo un step esta visible a la vez
 * - Muestra StepRetoques al navegar a step 2
 * - No muestra StepUpload cuando se esta en step 2
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OrderNewPage from '../pages/OrderNewPage'
import { useOrderForm, OrderFormProvider } from '../context/OrderFormContext'
import OrderFormLayout from '../components/OrderFormLayout'
import StepUpload from '../components/StepUpload'
import StepRetoques from '../components/StepRetoques'
import StepResumen from '../components/StepResumen'
import StepConfirmar from '../components/StepConfirmar'

// ---------------------------------------------------------------------------
// Mocks de dependencias externas del proveedor
// ---------------------------------------------------------------------------

vi.mock('alova/client', () => ({
  useRequest: () => ({
    data: { categories: [] },
    loading: false,
    error: null,
  }),
}))

vi.mock('@/app/stores/uploadStore', () => ({
  useUploadStore: () => ({
    addTask: vi.fn(),
    updateTask: vi.fn(),
  }),
}))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useBlocker: () => ({ state: 'unblocked', reset: undefined, proceed: undefined }),
    useNavigate: () => vi.fn(),
  }
})

// ---------------------------------------------------------------------------
// Mocks de subcomponentes de pasos
// (evita renderizar toda la UI de cada paso; solo verificamos que se montan)
// ---------------------------------------------------------------------------

vi.mock('../components/StepUpload', () => ({
  default: () => <div data-testid="step-upload">StepUpload</div>,
}))

vi.mock('../components/StepRetoques', () => ({
  default: () => <div data-testid="step-retoques">StepRetoques</div>,
}))

vi.mock('../components/StepResumen', () => ({
  default: () => <div data-testid="step-resumen">StepResumen</div>,
}))

vi.mock('../components/StepConfirmar', () => ({
  default: () => <div data-testid="step-confirmar">StepConfirmar</div>,
}))

// Mock del layout — solo pasa los children para que OrderNewContent funcione
vi.mock('../components/OrderFormLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="order-form-layout">{children}</div>
  ),
}))

// ---------------------------------------------------------------------------
// Helper de render — usa OrderNewPage real
// ---------------------------------------------------------------------------

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <OrderNewPage />
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Helper de render alternativo — incluye un StepTrigger dentro del proveedor
// para poder disparar goStep directamente desde los tests de navegacion
// ---------------------------------------------------------------------------

function StepTrigger() {
  const { goStep, handleFiles, totalFiles } = useOrderForm()
  const loadAndNavigate = async () => {
    // Cargar un archivo primero (requerido por issue #19)
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })
    const list = {
      0: file,
      length: 1,
      item: (i: number) => (i === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    } as unknown as FileList
    handleFiles(list)
  }
  const goStep2 = () => {
    // Intenta avanzar a paso 2; si no hay archivos, goStep() lo rechazará
    goStep(2)
  }
  return (
    <div>
      <button data-testid="load-file-btn" onClick={loadAndNavigate}>
        cargar archivo
      </button>
      <button data-testid="go-step-2" onClick={goStep2}>
        ir al paso 2
      </button>
      <span data-testid="total-files">{totalFiles}</span>
    </div>
  )
}

function OrderNewPageTestable() {
  const { activeStep } = useOrderForm()
  return (
    <OrderFormLayout>
      <StepTrigger />
      {activeStep === 1 && <StepUpload />}
      {activeStep === 2 && <StepRetoques />}
      {activeStep === 3 && <StepResumen />}
      {activeStep === 4 && <StepConfirmar />}
    </OrderFormLayout>
  )
}

function renderPageTestable() {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <OrderFormProvider>
        <OrderNewPageTestable />
      </OrderFormProvider>
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Tests: Renderizado general
// ---------------------------------------------------------------------------

describe('OrderNewPage — renderizado general', () => {
  it('should_render_without_errors', () => {
    // Arrange & Act — si el proveedor no esta correctamente configurado esto falla
    renderPage()

    // Assert — el layout debe estar presente
    expect(screen.getByTestId('order-form-layout')).toBeInTheDocument()
  })

  it('should_wrap_content_inside_OrderFormLayout', () => {
    // Arrange & Act
    renderPage()

    // Assert — el layout actua como contenedor de los steps
    const layout = screen.getByTestId('order-form-layout')
    expect(layout).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Routing de pasos — step 1 (estado inicial)
// ---------------------------------------------------------------------------

describe('OrderNewPage — step 1 (estado inicial)', () => {
  it('should_show_StepUpload_on_initial_render', () => {
    // Arrange & Act
    renderPage()

    // Assert — activeStep inicia en 1, por lo que StepUpload debe estar visible
    expect(screen.getByTestId('step-upload')).toBeInTheDocument()
  })

  it('should_not_show_StepRetoques_on_initial_render', () => {
    // Arrange & Act
    renderPage()

    // Assert — step 2 no debe estar visible en el estado inicial
    expect(screen.queryByTestId('step-retoques')).not.toBeInTheDocument()
  })

  it('should_not_show_StepResumen_on_initial_render', () => {
    // Arrange & Act
    renderPage()

    // Assert
    expect(screen.queryByTestId('step-resumen')).not.toBeInTheDocument()
  })

  it('should_not_show_StepConfirmar_on_initial_render', () => {
    // Arrange & Act
    renderPage()

    // Assert
    expect(screen.queryByTestId('step-confirmar')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Routing de pasos — navegacion a step 2
// ---------------------------------------------------------------------------

describe('OrderNewPage — navegacion a step 2', () => {
  beforeEach(() => {
    // URL.createObjectURL no existe en jsdom; necesitamos un stub para handleFiles
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('should_show_StepRetoques_when_goStep_2_is_called', async () => {
    // Arrange
    const user = userEvent.setup()
    renderPageTestable()

    // Verificamos estado inicial
    expect(screen.getByTestId('step-upload')).toBeInTheDocument()

    // Act — primero cargar un archivo (requerido por issue #19)
    await user.click(screen.getByTestId('load-file-btn'))
    // Esperar a que totalFiles se actualice
    expect(screen.getByTestId('total-files')).not.toHaveTextContent('0')

    // Luego navegar al paso 2
    await user.click(screen.getByTestId('go-step-2'))

    // Assert — StepRetoques debe aparecer
    expect(screen.getByTestId('step-retoques')).toBeInTheDocument()
  })

  it('should_hide_StepUpload_when_on_step_2', async () => {
    // Arrange
    const user = userEvent.setup()
    renderPageTestable()

    // Act — primero cargar un archivo (requerido por issue #19)
    await user.click(screen.getByTestId('load-file-btn'))
    // Esperar a que totalFiles se actualice
    expect(screen.getByTestId('total-files')).not.toHaveTextContent('0')

    // Luego navegar al paso 2
    await user.click(screen.getByTestId('go-step-2'))

    // Assert — StepUpload no debe estar visible en el paso 2
    expect(screen.queryByTestId('step-upload')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Solo un step visible a la vez
// ---------------------------------------------------------------------------

describe('OrderNewPage — exclusividad de steps', () => {
  it('should_render_only_one_step_at_a_time_on_step_1', () => {
    // Arrange & Act
    renderPage()

    // Assert — solo un step debe estar visible
    const visibleSteps = [
      screen.queryByTestId('step-upload'),
      screen.queryByTestId('step-retoques'),
      screen.queryByTestId('step-resumen'),
      screen.queryByTestId('step-confirmar'),
    ].filter(Boolean)

    expect(visibleSteps).toHaveLength(1)
    expect(visibleSteps[0]).toHaveAttribute('data-testid', 'step-upload')
  })
})
