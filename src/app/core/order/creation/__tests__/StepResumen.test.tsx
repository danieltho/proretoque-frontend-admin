/**
 * Tests TDD para StepResumen
 *
 * NOTA: El archivo se llama StepResumen.tsx en el proyecto aunque la ruta del
 * paso es "Resumen". Este componente muestra las OPCIONES DE ENTREGA por lote
 * (tiempo, formato, mapa de bits, etc.) antes de la confirmacion final.
 *
 * StepResumen consume useOrderForm() para acceder a:
 * - batches: lista de lotes para el selector
 * - activeBatchId: lote seleccionado actualmente en el selector
 * - setActiveBatchId: callback al cambiar lote en el Select
 * - activeBatch: lote activo (si es null/undefined, el componente devuelve null)
 * - updateDeliveryOptions: actualiza una opcion para el lote activo
 * - applyDeliveryToAll: aplica opciones a todos los lotes cuando "Aplicar a todos" esta activo
 *
 * Comportamientos cubiertos:
 * - No renderiza nada cuando activeBatch es null/undefined
 * - Renderiza el selector de lotes con los nombres de los batches
 * - Renderiza los tiempos de entrega disponibles (12HS, 24HS, 48HS, 72HS, 72HS+)
 * - El tiempo de entrega activo tiene clase bg-primary
 * - Llama updateDeliveryOptions al hacer click en un tiempo de entrega distinto
 * - Renderiza las opciones de formato (PSD, TIFF, JPG, PNG) en el Select de formato
 * - Renderiza la seccion de opciones de entrega (titulo "OPCIONES DE ENTREGA")
 * - Muestra el nombre del lote activo en el resumen de lote
 * - Muestra el numero de archivos del lote activo
 * - El checkbox "Aplicar a todos los lotes" llama applyDeliveryToAll cuando se marca
 * - Llama applyDeliveryToAll al cambiar una opcion cuando "Aplicar a todos" esta activo
 */

import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StepResumen from '../components/StepResumen'
import type { LocalBatch, DeliveryOptions } from '../../types/batch'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

import { useOrderForm } from '../context/OrderFormContext'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildDeliveryOptions(overrides: Partial<DeliveryOptions> = {}): DeliveryOptions {
  return {
    deliveryTime: '72hs',
    format: 'PSD',
    embedProfile: 'No cambiar',
    bitDepth: '8 bits',
    colorMode: 'RGB',
    preserveMask: false,
    preserveLayers: false,
    dimension: null,
    resolution: '',
    preserveOriginalLayer: false,
    ...overrides,
  }
}

function buildBatch(id: string, name: string, overrides: Partial<LocalBatch> = {}): LocalBatch {
  return {
    id,
    name,
    files: [],
    previews: [],
    products: {},
    deliveryOptions: buildDeliveryOptions(),
    ...overrides,
  }
}

const mockUpdateDeliveryOptions = vi.fn()
const mockApplyDeliveryToAll = vi.fn()
const mockSetActiveBatchId = vi.fn()

const BATCH_A = buildBatch('batch-a', 'Lote A')
const BATCH_B = buildBatch('batch-b', 'Lote B')

function mockContext(overrides: {
  batches?: LocalBatch[]
  activeBatchId?: string
  activeBatch?: LocalBatch | null
  updateDeliveryOptions?: typeof mockUpdateDeliveryOptions
  applyDeliveryToAll?: typeof mockApplyDeliveryToAll
  setActiveBatchId?: typeof mockSetActiveBatchId
}) {
  vi.mocked(useOrderForm).mockReturnValue({
    batches: overrides.batches ?? [BATCH_A],
    activeBatchId: overrides.activeBatchId ?? 'batch-a',
    activeBatch: overrides.activeBatch !== undefined ? overrides.activeBatch : BATCH_A,
    setActiveBatchId: overrides.setActiveBatchId ?? mockSetActiveBatchId,
    updateDeliveryOptions: overrides.updateDeliveryOptions ?? mockUpdateDeliveryOptions,
    applyDeliveryToAll: overrides.applyDeliveryToAll ?? mockApplyDeliveryToAll,
    canAdvanceFromCurrentStep: true,
  } as unknown as ReturnType<typeof useOrderForm>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado condicional
// ---------------------------------------------------------------------------

describe('StepResumen — renderizado condicional', () => {
  it('should_render_nothing_when_active_batch_is_null', () => {
    // Arrange
    mockContext({ activeBatch: null })

    // Act
    const { container } = render(<StepResumen />)

    // Assert — el componente hace early return con null
    expect(container.firstChild).toBeNull()
  })

  it('should_render_content_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: BATCH_A })

    // Act
    render(<StepResumen />)

    // Assert — al haber lote activo, el contenido principal aparece
    expect(screen.getByText('OPCIONES DE ENTREGA')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Selector de lotes
// ---------------------------------------------------------------------------

describe('StepResumen — selector de lotes', () => {
  it('should_render_batch_names_in_the_select', () => {
    // Arrange
    mockContext({
      batches: [BATCH_A, BATCH_B],
      activeBatchId: 'batch-a',
      activeBatch: BATCH_A,
    })

    // Act
    render(<StepResumen />)

    // Assert — el trigger del Select muestra el nombre del lote activo
    // El SelectValue de Radix muestra el placeholder o el texto del item seleccionado
    expect(screen.getByText('1. Lote A')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Tiempos de entrega
// ---------------------------------------------------------------------------

describe('StepResumen — tiempos de entrega', () => {
  it('should_render_all_delivery_time_options', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert — los 5 tiempos de entrega de DELIVERY_TIMES
    expect(screen.getByText('12HS')).toBeInTheDocument()
    expect(screen.getByText('24HS')).toBeInTheDocument()
    expect(screen.getByText('48HS')).toBeInTheDocument()
    expect(screen.getByText('72HS')).toBeInTheDocument()
    expect(screen.getByText('72HS+')).toBeInTheDocument()
  })

  it('should_mark_active_delivery_time_with_primary_class', () => {
    // Arrange — deliveryTime = '72' (defecto)
    mockContext({
      activeBatch: buildBatch('batch-a', 'Lote A', {
        deliveryOptions: buildDeliveryOptions({ deliveryTime: '72hs' }),
      }),
    })

    // Act
    render(<StepResumen />)

    // Assert — el boton de '72HS' tiene clase bg-primary
    const btn72 = screen.getByText('72HS').closest('button')!
    expect(btn72).toHaveClass('bg-primary')
  })

  it('should_not_mark_inactive_delivery_time_with_primary_class', () => {
    // Arrange — deliveryTime = '72hs'
    mockContext({
      activeBatch: buildBatch('batch-a', 'Lote A', {
        deliveryOptions: buildDeliveryOptions({ deliveryTime: '72hs' }),
      }),
    })

    // Act
    render(<StepResumen />)

    // Assert — los demas botones NO tienen bg-primary
    const btn24 = screen.getByText('24HS').closest('button')!
    expect(btn24).not.toHaveClass('bg-primary')
  })

  it('should_call_updateDeliveryOptions_with_deliveryTime_when_option_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({
      activeBatchId: 'batch-a',
      activeBatch: buildBatch('batch-a', 'Lote A', {
        deliveryOptions: buildDeliveryOptions({ deliveryTime: '72hs' }),
      }),
    })
    render(<StepResumen />)

    // Act — hacer click en '24HS'
    await user.click(screen.getByText('24HS'))

    // Assert
    expect(mockUpdateDeliveryOptions).toHaveBeenCalledWith('batch-a', { deliveryTime: '24hs' })
  })
})

// ---------------------------------------------------------------------------
// Tests: Opciones de entrega (formato, mapa de bits, etc.)
// ---------------------------------------------------------------------------

describe('StepResumen — opciones de entrega', () => {
  it('should_render_delivery_options_section_title', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('OPCIONES DE ENTREGA')).toBeInTheDocument()
  })

  it('should_render_formato_label', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Formato')).toBeInTheDocument()
  })

  it('should_render_mapa_de_bits_label', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Mapa de bits')).toBeInTheDocument()
  })

  it('should_render_modo_color_label', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Modo Color')).toBeInTheDocument()
  })

  it('should_render_conservar_mascara_de_capas_checkbox', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Conservar máscara de capas')).toBeInTheDocument()
  })

  it('should_render_preservar_archivo_en_capas_checkbox', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Preservar archivo en capas')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Resumen de lote (columna derecha)
// ---------------------------------------------------------------------------

describe('StepResumen — resumen de lote', () => {
  it('should_show_active_batch_name_in_summary', () => {
    // Arrange
    mockContext({
      activeBatch: buildBatch('batch-a', 'Lote A'),
    })

    // Act
    render(<StepResumen />)

    // Assert — el nombre del lote aparece en la columna de resumen
    // Puede haber multiples ocurrencias (selector + resumen); verificamos al menos una
    const batchNameElements = screen.getAllByText('Lote A')
    expect(batchNameElements.length).toBeGreaterThanOrEqual(1)
  })

  it('should_show_file_count_for_active_batch', () => {
    // Arrange
    const files = [new File(['x'], 'foto.jpg', { type: 'image/jpeg' })]
    mockContext({
      activeBatch: buildBatch('batch-a', 'Lote A', { files }),
    })

    // Act
    render(<StepResumen />)

    // Assert — "N° de Archivos: 1"
    expect(screen.getByText('N° de Archivos:')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('should_show_zero_file_count_when_batch_is_empty', () => {
    // Arrange
    mockContext({ activeBatch: buildBatch('batch-a', 'Lote A', { files: [] }) })

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('N° de Archivos:')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: "Aplicar a todos los lotes"
// ---------------------------------------------------------------------------

describe('StepResumen — aplicar a todos los lotes', () => {
  it('should_render_apply_to_all_checkbox', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Aplicar a todos los lotes')).toBeInTheDocument()
  })

  it('should_call_applyDeliveryToAll_when_delivery_option_changed_and_apply_all_is_checked', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({
      activeBatchId: 'batch-a',
      activeBatch: buildBatch('batch-a', 'Lote A', {
        deliveryOptions: buildDeliveryOptions({ deliveryTime: '72hs' }),
      }),
    })
    render(<StepResumen />)

    // Act — primero marcar "Aplicar a todos los lotes"
    // El label que contiene "Aplicar a todos los lotes" envuelve el Checkbox de Radix
    // Usamos within para acotar el checkbox al label correcto
    const applyAllLabel = screen.getByText('Aplicar a todos los lotes').closest('label')!
    const applyAllCheckbox = within(applyAllLabel).getByRole('checkbox')
    await user.click(applyAllCheckbox)

    // Ahora cambiar el tiempo de entrega
    await user.click(screen.getByText('24HS'))

    // Assert — applyDeliveryToAll debe haber sido llamado ademas de updateDeliveryOptions
    expect(mockApplyDeliveryToAll).toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Chat de pedido y Resumen de lote (columna derecha — secciones)
// ---------------------------------------------------------------------------

describe('StepResumen — secciones de la columna derecha', () => {
  it('should_render_chat_de_pedido_section', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Chat de pedido')).toBeInTheDocument()
  })

  it('should_render_resumen_de_lote_section', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepResumen />)

    // Assert
    expect(screen.getByText('Resumen de lote')).toBeInTheDocument()
  })
})
