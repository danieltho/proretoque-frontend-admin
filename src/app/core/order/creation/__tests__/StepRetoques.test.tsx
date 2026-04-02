/**
 * Tests TDD para StepRetoques
 *
 * StepRetoques consume useOrderForm() para acceder a:
 * - categories: lista de categorias disponibles (sidebar)
 * - activeCategoryId: id de la categoria activa
 * - activeBatchId: id del lote activo (key del ProductGrid)
 * - setSelectedCategoryId: callback al seleccionar una categoria
 *
 * StepRetoques renderiza como hijos:
 * - <BatchTabs /> (sin showRename ni showRemove en el paso de retoques)
 * - Sidebar de categorias (botones de categoria)
 * - <ProductGrid /> cuando hay una categoria activa
 * - <BatchSummaryPanel />
 *
 * El contexto se mockea a nivel de modulo.
 * BatchTabs, ProductGrid y BatchSummaryPanel se mockean para aislar StepRetoques.
 *
 * Comportamientos cubiertos:
 * - Renderiza BatchTabs sin showRename ni showRemove
 * - Renderiza una lista de botones de categoria por cada item en categories
 * - No renderiza botones de categoria cuando la lista esta vacia
 * - El boton de la categoria activa tiene clase bg-accent (resaltado)
 * - Los botones de categoria inactivos no tienen clase bg-accent
 * - Llama setSelectedCategoryId con el id correcto al hacer click en una categoria
 * - Renderiza ProductGrid cuando activeCategoryId no es null
 * - No renderiza ProductGrid cuando activeCategoryId es null
 * - Renderiza BatchSummaryPanel
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StepRetoques from '../components/StepRetoques'
import type { Category, CategoryGroup } from '@/shared/types/category'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

import { useOrderForm } from '../context/OrderFormContext'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos
// ---------------------------------------------------------------------------

vi.mock('../components/BatchTabs', () => ({
  default: (props: { showRename?: boolean; showRemove?: boolean }) => (
    <div
      data-testid="batch-tabs"
      data-show-rename={String(props.showRename ?? false)}
      data-show-remove={String(props.showRemove ?? false)}
    >
      BatchTabs
    </div>
  ),
}))

vi.mock('../components/ProductGrid', () => ({
  default: (props: { key?: string }) => (
    <div data-testid="product-grid" data-key={props.key}>
      ProductGrid
    </div>
  ),
}))

vi.mock('../components/BatchSummaryPanel', () => ({
  default: () => <div data-testid="batch-summary-panel">BatchSummaryPanel</div>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCategory(id: number, name: string): Category {
  return { id, name }
}

const mockSetSelectedCategoryId = vi.fn()

function mockContext(overrides: {
  categories?: Category[]
  categoryGroups?: CategoryGroup[]
  activeCategoryId?: number | null
  activeBatchId?: string
}) {
  vi.mocked(useOrderForm).mockReturnValue({
    categories: overrides.categories ?? [],
    categoryGroups: overrides.categoryGroups ?? [],
    activeCategoryId: overrides.activeCategoryId ?? null,
    activeBatchId: overrides.activeBatchId ?? 'batch-1',
    setSelectedCategoryId: mockSetSelectedCategoryId,
    canAdvanceFromCurrentStep: true,
  } as unknown as ReturnType<typeof useOrderForm>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado de BatchTabs
// ---------------------------------------------------------------------------

describe('StepRetoques — BatchTabs', () => {
  it('should_render_batch_tabs', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepRetoques />)

    // Assert
    expect(screen.getByTestId('batch-tabs')).toBeInTheDocument()
  })

  it('should_not_pass_showRename_to_batch_tabs_in_retoques_step', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepRetoques />)

    // Assert — en el paso de retoques no se renombran lotes
    const batchTabs = screen.getByTestId('batch-tabs')
    expect(batchTabs).toHaveAttribute('data-show-rename', 'false')
  })

  it('should_not_pass_showRemove_to_batch_tabs_in_retoques_step', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepRetoques />)

    // Assert
    const batchTabs = screen.getByTestId('batch-tabs')
    expect(batchTabs).toHaveAttribute('data-show-remove', 'false')
  })
})

// ---------------------------------------------------------------------------
// Tests: Sidebar de categorias
// ---------------------------------------------------------------------------

describe('StepRetoques — sidebar de categorias', () => {
  it('should_render_a_button_per_category', () => {
    // Arrange
    const categories = [
      buildCategory(1, 'Retratos'),
      buildCategory(2, 'Paisajes'),
      buildCategory(3, 'Productos'),
    ]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<StepRetoques />)

    // Assert
    expect(screen.getByText('Retratos')).toBeInTheDocument()
    expect(screen.getByText('Paisajes')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
  })

  it('should_render_no_category_buttons_when_categories_is_empty', () => {
    // Arrange
    mockContext({ categories: [], activeCategoryId: null })

    // Act
    render(<StepRetoques />)

    // Assert — no hay ninguna categoria
    // El sidebar esta vacio; verificamos con un query que no encontrara categoria real
    const categoryButtons = screen.queryAllByRole('button', { name: /Retratos|Paisajes|Productos/ })
    expect(categoryButtons).toHaveLength(0)
  })

  it('should_mark_active_category_button_with_accent_class', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<StepRetoques />)

    // Assert — el boton de la categoria activa tiene bg-accent
    const activeBtn = screen.getByText('Retratos').closest('button')!
    expect(activeBtn).toHaveClass('bg-accent')
  })

  it('should_not_mark_inactive_category_button_with_accent_class', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<StepRetoques />)

    // Assert — el boton de la categoria inactiva NO tiene bg-accent (solo tiene hover)
    const inactiveBtn = screen.getByText('Paisajes').closest('button')!
    expect(inactiveBtn).not.toHaveClass('bg-accent')
  })

  it('should_call_setSelectedCategoryId_with_category_id_when_category_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })
    render(<StepRetoques />)

    // Act — hacer click en "Paisajes"
    await user.click(screen.getByText('Paisajes'))

    // Assert
    expect(mockSetSelectedCategoryId).toHaveBeenCalledWith(2)
    expect(mockSetSelectedCategoryId).toHaveBeenCalledTimes(1)
  })

  it('should_call_setSelectedCategoryId_with_first_category_id_when_first_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const categories = [buildCategory(10, 'Retratos'), buildCategory(20, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 20 })
    render(<StepRetoques />)

    // Act
    await user.click(screen.getByText('Retratos'))

    // Assert
    expect(mockSetSelectedCategoryId).toHaveBeenCalledWith(10)
  })
})

// ---------------------------------------------------------------------------
// Tests: ProductGrid
// ---------------------------------------------------------------------------

describe('StepRetoques — ProductGrid', () => {
  it('should_render_product_grid_when_active_category_is_set', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos')]
    mockContext({ categories, activeCategoryId: 1, activeBatchId: 'batch-1' })

    // Act
    render(<StepRetoques />)

    // Assert
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('should_not_render_product_grid_when_active_category_is_null', () => {
    // Arrange
    mockContext({ categories: [], activeCategoryId: null })

    // Act
    render(<StepRetoques />)

    // Assert
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: BatchSummaryPanel
// ---------------------------------------------------------------------------

describe('StepRetoques — BatchSummaryPanel', () => {
  it('should_render_batch_summary_panel', () => {
    // Arrange
    mockContext({})

    // Act
    render(<StepRetoques />)

    // Assert
    expect(screen.getByTestId('batch-summary-panel')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Grupos de categorías (feature #36 — Tags en categorías)
// ---------------------------------------------------------------------------

describe('StepRetoques — grupos de categorías (feature #36)', () => {
  it('should_render_category_group_headers_in_sidebar', () => {
    // Arrange — el contexto expone categoryGroups con sus labels
    const categoryGroups: CategoryGroup[] = [
      {
        tag: 'retoque',
        label: 'Retoques',
        categories: [{ id: 1, name: 'Retrato' }],
      },
      {
        tag: 'opciones-de-entrega',
        label: 'Opciones de entrega',
        categories: [{ id: 2, name: 'Express' }],
      },
      {
        tag: 'tiempo-de-entrega',
        label: 'Tiempo de entrega',
        categories: [{ id: 3, name: '24h' }],
      },
    ]
    mockContext({ categoryGroups, activeCategoryId: 1 })

    // Act
    render(<StepRetoques />)

    // Assert — los headers de los 3 grupos son visibles en el sidebar
    expect(screen.getByText('Retoques')).toBeInTheDocument()
    expect(screen.getByText('Opciones de entrega')).toBeInTheDocument()
    expect(screen.getByText('Tiempo de entrega')).toBeInTheDocument()
  })

  it('should_select_first_category_of_first_group_by_default', () => {
    // Arrange — el contexto establece activeCategoryId al primer elemento del primer grupo
    const categoryGroups: CategoryGroup[] = [
      {
        tag: 'retoque',
        label: 'Retoques',
        categories: [
          { id: 10, name: 'Retrato' },
          { id: 11, name: 'Paisaje' },
        ],
      },
      {
        tag: 'opciones-de-entrega',
        label: 'Opciones de entrega',
        categories: [{ id: 20, name: 'Express' }],
      },
    ]
    // activeCategoryId = 10 (primer item del primer grupo)
    mockContext({ categoryGroups, activeCategoryId: 10 })

    // Act
    render(<StepRetoques />)

    // Assert — la primera categoría del primer grupo aparece resaltada (bg-accent)
    // y el ProductGrid se muestra porque hay categoría activa
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
    // El botón de la primera categoría del primer grupo está marcado como activo
    const retratoBtn = screen.getByRole('button', { name: 'Retrato' })
    expect(retratoBtn).toBeInTheDocument()
    // Mientras que el botón de otra categoría NO está activo
    const paisajeBtn = screen.getByRole('button', { name: 'Paisaje' })
    expect(paisajeBtn.className).not.toBe(retratoBtn.className)
  })
})
