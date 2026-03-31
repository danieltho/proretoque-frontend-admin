/**
 * Tests TDD para OrderFormContext
 *
 * Ciclo Red-Green-Refactor para los comportamientos del contexto
 * del formulario de creacion de pedidoes.
 *
 * Dependencias externas mockeadas:
 * - alova/client (useRequest) — evita llamadas HTTP reales
 * - @/app/stores/uploadStore — aislamos el estado global de uploads
 * - react-router-dom useBlocker — sin necesidad de navegacion real
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OrderFormProvider, useOrderForm } from '../context/OrderFormContext'

// ---------------------------------------------------------------------------
// Mocks de dependencias externas
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

// useBlocker devuelve un blocker en estado 'unblocked' por defecto
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return {
    ...actual,
    useBlocker: () => ({ state: 'unblocked', reset: undefined, proceed: undefined }),
  }
})

// ---------------------------------------------------------------------------
// Helper: Componente que expone los valores del contexto al DOM para testing
// ---------------------------------------------------------------------------

function ContextInspector() {
  const ctx = useOrderForm()
  return (
    <div>
      <span data-testid="active-step">{ctx.activeStep}</span>
      <span data-testid="order-name">{ctx.orderName}</span>
      <span data-testid="batch-count">{ctx.batchCount}</span>
      <span data-testid="total-files">{ctx.totalFiles}</span>
      <span data-testid="can-submit">{String(ctx.canSubmit)}</span>
    </div>
  )
}

function renderWithProvider(ui: React.ReactElement) {
  return render(
    <MemoryRouter initialEntries={['/orders/new']}>
      <OrderFormProvider>{ui}</OrderFormProvider>
    </MemoryRouter>,
  )
}

// ---------------------------------------------------------------------------
// Tests: Estado inicial del contexto
// ---------------------------------------------------------------------------

describe('OrderFormProvider — estado inicial', () => {
  it('should_provide_activeStep_1_on_mount', () => {
    // Arrange & Act
    renderWithProvider(<ContextInspector />)

    // Assert
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })

  it('should_provide_empty_orderName_on_mount', () => {
    // Arrange & Act
    renderWithProvider(<ContextInspector />)

    // Assert
    expect(screen.getByTestId('order-name')).toHaveTextContent('')
  })

  it('should_provide_one_batch_on_mount', () => {
    // Arrange & Act
    renderWithProvider(<ContextInspector />)

    // Assert — inicia con exactamente 1 lote (el "Lote 1" que crea useBatchManager)
    expect(screen.getByTestId('batch-count')).toHaveTextContent('1')
  })

  it('should_provide_zero_totalFiles_on_mount', () => {
    // Arrange & Act
    renderWithProvider(<ContextInspector />)

    // Assert
    expect(screen.getByTestId('total-files')).toHaveTextContent('0')
  })

  it('should_have_canSubmit_false_on_mount', () => {
    // Arrange & Act
    renderWithProvider(<ContextInspector />)

    // Assert — sin orderName y sin archivos, canSubmit debe ser false
    expect(screen.getByTestId('can-submit')).toHaveTextContent('false')
  })
})

// ---------------------------------------------------------------------------
// Tests: goStep — navegacion entre pasos
// ---------------------------------------------------------------------------

function StepNavigator() {
  const { activeStep, goStep } = useOrderForm()
  return (
    <div>
      <span data-testid="active-step">{activeStep}</span>
      <button onClick={() => goStep(2)}>ir a paso 2</button>
      <button onClick={() => goStep(3)}>ir a paso 3</button>
      <button onClick={() => goStep(0)}>ir a paso 0 (invalido)</button>
      <button onClick={() => goStep(5)}>ir a paso 5 (invalido)</button>
    </div>
  )
}

function FileLoader() {
  const { handleFiles } = useOrderForm()
  const loadFile = () => {
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
  return (
    <button data-testid="load-file-btn" onClick={loadFile}>
      cargar archivo
    </button>
  )
}

describe('OrderFormProvider — goStep', () => {
  beforeEach(() => {
    // URL.createObjectURL no existe en jsdom; necesitamos un stub para handleFiles
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('should_change_activeStep_when_goStep_called_with_valid_step', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(
      <>
        <StepNavigator />
        <FileLoader />
      </>,
    )

    // Cargar archivo primero (requerido para avanzar desde step 1)
    await user.click(screen.getByTestId('load-file-btn'))

    // Act
    await user.click(screen.getByText('ir a paso 2'))

    // Assert
    expect(screen.getByTestId('active-step')).toHaveTextContent('2')
  })

  it('should_navigate_to_step_3_when_goStep_3_is_called', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(
      <>
        <StepNavigator />
        <FileLoader />
      </>,
    )

    // Cargar archivo primero (requerido para avanzar desde step 1)
    await user.click(screen.getByTestId('load-file-btn'))

    // Act
    await user.click(screen.getByText('ir a paso 3'))

    // Assert
    expect(screen.getByTestId('active-step')).toHaveTextContent('3')
  })

  it('should_not_change_activeStep_when_step_is_below_1', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<StepNavigator />)

    // Act — intentar ir al paso 0 (invalido)
    await user.click(screen.getByText('ir a paso 0 (invalido)'))

    // Assert — debe mantenerse en paso 1
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })

  it('should_not_change_activeStep_when_step_is_above_4', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<StepNavigator />)

    // Act — intentar ir al paso 5 (invalido)
    await user.click(screen.getByText('ir a paso 5 (invalido)'))

    // Assert — debe mantenerse en paso 1
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })
})

// ---------------------------------------------------------------------------
// Tests: canSubmit — validaciones para envio
// ---------------------------------------------------------------------------

function SubmitStateInspector() {
  const { canSubmit, setOrderName, orderName } = useOrderForm()
  return (
    <div>
      <span data-testid="can-submit">{String(canSubmit)}</span>
      <span data-testid="order-name">{orderName}</span>
      <input
        data-testid="order-name-input"
        value={orderName}
        onChange={(e) => setOrderName(e.target.value)}
        placeholder="nombre"
      />
    </div>
  )
}

describe('OrderFormProvider — canSubmit', () => {
  it('should_have_canSubmit_false_when_orderName_is_set_but_no_files', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<SubmitStateInspector />)

    // Act — escribir un nombre de pedido pero sin archivos
    await user.type(screen.getByTestId('order-name-input'), 'Mi pedido')

    // Assert — sin archivos, canSubmit sigue siendo false aunque haya nombre
    expect(screen.getByTestId('can-submit')).toHaveTextContent('false')
  })

  it('should_have_canSubmit_false_when_orderName_is_empty_even_after_typing_spaces', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<SubmitStateInspector />)

    // Act — escribir solo espacios (trim() da string vacio)
    await user.type(screen.getByTestId('order-name-input'), '   ')

    // Assert — solo espacios no cuenta como nombre valido
    expect(screen.getByTestId('can-submit')).toHaveTextContent('false')
  })
})

// ---------------------------------------------------------------------------
// Tests: handleSubmit — error handling y casos edge
// ---------------------------------------------------------------------------

function SubmitTester() {
  const { handleSubmit, setOrderName, canSubmit, submitting } = useOrderForm()
  return (
    <div>
      <span data-testid="submitting">{String(submitting)}</span>
      <span data-testid="can-submit">{String(canSubmit)}</span>
      <input
        data-testid="order-name-input"
        onChange={(e) => setOrderName(e.target.value)}
        placeholder="nombre"
      />
      <button data-testid="submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
        Enviar
      </button>
    </div>
  )
}

describe('OrderFormProvider — handleSubmit error handling', () => {
  it('should_not_submit_when_canSubmit_is_false', async () => {
    // Arrange
    renderWithProvider(<SubmitTester />)

    // Act — intentar hacer submit sin nombre
    const submitBtn = screen.getByTestId('submit-btn')
    expect(submitBtn).toBeDisabled()

    // Assert — el botón debe estar deshabilitado
    expect(screen.getByTestId('submitting')).toHaveTextContent('false')
  })

  it('should_return_early_from_handleSubmit_if_canSubmit_is_false', async () => {
    // Arrange
    renderWithProvider(<SubmitTester />)

    // Sin archivos ni nombre, canSubmit es false
    const submitBtn = screen.getByTestId('submit-btn')
    expect(submitBtn).toBeDisabled()

    // Assert — se debe estar deshabilitado
    expect(screen.getByTestId('can-submit')).toHaveTextContent('false')
  })

  it('should_not_call_createOrderApi_if_canSubmit_is_false', async () => {
    // Arrange
    renderWithProvider(<SubmitTester />)

    // Sin archivos, canSubmit es false
    // Assert — el botón debe estar deshabilitado, por lo que no se puede hacer click
    const submitBtn = screen.getByTestId('submit-btn')
    expect(submitBtn).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests issue #19: validacion de archivos antes de avanzar desde step 1
//
// Comportamiento requerido:
//   - goStep(n>1) desde step 1 sin archivos => NO avanza (totalFiles === 0)
//   - goStep(n>1) desde step 1 con archivos => SÍ avanza (totalFiles > 0)
//   - goStep retroceder (step 2 -> 1) => siempre permitido, sin importar archivos
//   - canAdvanceFromCurrentStep: false en step 1 sin archivos
//   - canAdvanceFromCurrentStep: true  en step 1 con archivos
//   - canAdvanceFromCurrentStep: true  en steps 2, 3, 4 (siempre)
//   - El boton "Siguiente" en OrderFormLayout esta disabled cuando !canAdvanceFromCurrentStep
//   - El boton "Siguiente" en OrderFormLayout esta enabled cuando canAdvanceFromCurrentStep
// ---------------------------------------------------------------------------

// Helper: componente que expone el nuevo campo canAdvanceFromCurrentStep
function AdvanceInspector() {
  const ctx = useOrderForm()
  return (
    <div>
      <span data-testid="active-step">{ctx.activeStep}</span>
      <span data-testid="total-files">{ctx.totalFiles}</span>
      <span data-testid="can-advance">
        {String(
          (ctx as { canAdvanceFromCurrentStep?: boolean }).canAdvanceFromCurrentStep ??
            'FIELD_MISSING',
        )}
      </span>
      <button onClick={() => ctx.goStep(2)}>ir a paso 2</button>
      <button onClick={() => ctx.goStep(3)}>ir a paso 3</button>
      <button onClick={() => ctx.goStep(1)}>ir a paso 1</button>
    </div>
  )
}

// Helper: componente que simula tener archivos cargados y luego intenta avanzar
function AdvanceWithFilesInspector() {
  const ctx = useOrderForm()
  // Creamos un archivo valido de imagen para simular carga
  const loadFile = () => {
    const file = new File(['dummy'], 'photo.jpg', { type: 'image/jpeg' })
    const list = {
      0: file,
      length: 1,
      item: (i: number) => (i === 0 ? file : null),
      [Symbol.iterator]: function* () {
        yield file
      },
    } as unknown as FileList
    ctx.handleFiles(list)
  }
  return (
    <div>
      <span data-testid="active-step">{ctx.activeStep}</span>
      <span data-testid="total-files">{ctx.totalFiles}</span>
      <span data-testid="can-advance">
        {String(
          (ctx as { canAdvanceFromCurrentStep?: boolean }).canAdvanceFromCurrentStep ??
            'FIELD_MISSING',
        )}
      </span>
      <button data-testid="load-file-btn" onClick={loadFile}>
        cargar archivo
      </button>
      <button data-testid="go-step-2-btn" onClick={() => ctx.goStep(2)}>
        ir a paso 2
      </button>
      <button data-testid="go-step-3-btn" onClick={() => ctx.goStep(3)}>
        ir a paso 3
      </button>
      <button data-testid="go-step-1-btn" onClick={() => ctx.goStep(1)}>
        retroceder a paso 1
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Tests: goStep — validacion de archivos al avanzar desde step 1
// ---------------------------------------------------------------------------

describe('OrderFormProvider — goStep con validacion de archivos (issue #19)', () => {
  beforeEach(() => {
    // URL.createObjectURL no existe en jsdom; necesitamos un stub para handleFiles
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('should_not_advance_from_step1_to_step2_when_totalFiles_is_zero', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<AdvanceInspector />)

    // Verificamos que estamos en step 1 sin archivos
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
    expect(screen.getByTestId('total-files')).toHaveTextContent('0')

    // Act — intentar avanzar sin archivos
    await user.click(screen.getByText('ir a paso 2'))

    // Assert — debe quedarse en step 1
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })

  it('should_advance_from_step1_to_step2_when_totalFiles_is_greater_than_zero', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<AdvanceWithFilesInspector />)

    // Cargamos un archivo primero
    await user.click(screen.getByTestId('load-file-btn'))
    expect(screen.getByTestId('total-files')).not.toHaveTextContent('0')

    // Act — intentar avanzar con archivos cargados
    await user.click(screen.getByTestId('go-step-2-btn'))

    // Assert — debe avanzar al step 2
    expect(screen.getByTestId('active-step')).toHaveTextContent('2')
  })

  it('should_allow_going_back_from_step2_to_step1_regardless_of_totalFiles', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<AdvanceWithFilesInspector />)

    // Primero cargamos archivo y avanzamos a step 2
    await user.click(screen.getByTestId('load-file-btn'))
    await user.click(screen.getByTestId('go-step-2-btn'))
    expect(screen.getByTestId('active-step')).toHaveTextContent('2')

    // Act — retroceder a step 1 (debe funcionar siempre)
    await user.click(screen.getByTestId('go-step-1-btn'))

    // Assert — debe volver al step 1
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })

  it('should_not_advance_from_step1_to_step3_when_totalFiles_is_zero', async () => {
    // Arrange — saltar directamente de step 1 a step 3 sin archivos
    const user = userEvent.setup()
    renderWithProvider(<AdvanceInspector />)

    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
    expect(screen.getByTestId('total-files')).toHaveTextContent('0')

    // Act
    await user.click(screen.getByText('ir a paso 3'))

    // Assert — el salto queda bloqueado
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
  })
})

// ---------------------------------------------------------------------------
// Tests: canAdvanceFromCurrentStep — valor expuesto en el contexto
// ---------------------------------------------------------------------------

describe('OrderFormProvider — canAdvanceFromCurrentStep (issue #19)', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn(() => 'blob:mock-url'),
      revokeObjectURL: vi.fn(),
    })
  })

  it('should_expose_canAdvanceFromCurrentStep_false_when_on_step1_with_no_files', () => {
    // Arrange & Act
    renderWithProvider(<AdvanceInspector />)

    // Assert — step 1 sin archivos => no puede avanzar
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
    expect(screen.getByTestId('total-files')).toHaveTextContent('0')
    expect(screen.getByTestId('can-advance')).toHaveTextContent('false')
  })

  it('should_expose_canAdvanceFromCurrentStep_true_when_on_step1_with_files', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<AdvanceWithFilesInspector />)

    // Act — cargar un archivo
    await user.click(screen.getByTestId('load-file-btn'))

    // Assert — step 1 con archivos => puede avanzar
    expect(screen.getByTestId('active-step')).toHaveTextContent('1')
    expect(screen.getByTestId('can-advance')).toHaveTextContent('true')
  })

  it('should_expose_canAdvanceFromCurrentStep_true_when_on_step2', async () => {
    // Arrange
    const user = userEvent.setup()
    renderWithProvider(<AdvanceWithFilesInspector />)

    // Cargar archivo y avanzar a step 2
    await user.click(screen.getByTestId('load-file-btn'))
    await user.click(screen.getByTestId('go-step-2-btn'))

    // Assert — en step 2 siempre puede avanzar
    expect(screen.getByTestId('active-step')).toHaveTextContent('2')
    expect(screen.getByTestId('can-advance')).toHaveTextContent('true')
  })
})
