/**
 * Tests TDD para EditStepRetoques
 *
 * EditStepRetoques consume useOrderEdit() para acceder a:
 * - categories: lista de categorías disponibles (sidebar)
 * - activeCategoryId: id de la categoría activa
 * - activeBatchId: id del lote activo (key del ProductGrid)
 * - setSelectedCategoryId: callback al seleccionar una categoría
 *
 * EditStepRetoques renderiza como hijos:
 * - <EditBatchTabs /> siempre
 * - Sidebar de categorías (botones de categoría)
 * - <ProductGrid /> cuando hay una categoría activa
 * - No renderiza ProductGrid sin categoría activa
 *
 * El contexto se mockea a nivel de módulo.
 * EditBatchTabs y ProductGrid se mockean para aislar EditStepRetoques.
 *
 * Comportamientos cubiertos:
 * - Renderiza EditBatchTabs
 * - Renderiza un botón por categoría en el sidebar
 * - La categoría activa tiene clase bg-accent
 * - Clic en categoría llama setSelectedCategoryId con el id correcto
 * - Renderiza ProductGrid cuando hay categoría activa
 * - No renderiza ProductGrid sin categoría activa
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditStepRetoques from '../components/EditStepRetoques'
import type { Category, CategoryGroup } from '@/shared/types/category'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderEditContext', () => ({
  useOrderEdit: vi.fn(),
}))

import { useOrderEdit } from '../context/OrderEditContext'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos
// ---------------------------------------------------------------------------

vi.mock('../components/EditBatchTabs', () => ({
  default: () => <div data-testid="edit-batch-tabs">EditBatchTabs</div>,
}))

vi.mock('../../creation/components/ProductGrid', () => ({
  default: () => <div data-testid="product-grid">ProductGrid</div>,
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
  activeBatchId?: number | null
}) {
  vi.mocked(useOrderEdit).mockReturnValue({
    categories: overrides.categories ?? [],
    categoryGroups: overrides.categoryGroups ?? [],
    activeCategoryId: overrides.activeCategoryId ?? null,
    activeBatchId: overrides.activeBatchId ?? 1,
    setSelectedCategoryId: mockSetSelectedCategoryId,
  } as unknown as ReturnType<typeof useOrderEdit>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado de EditBatchTabs
// ---------------------------------------------------------------------------

describe('EditStepRetoques — EditBatchTabs', () => {
  it('should_render_edit_batch_tabs', () => {
    // Arrange
    mockContext({})

    // Act
    render(<EditStepRetoques />)

    // Assert
    expect(screen.getByTestId('edit-batch-tabs')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Sidebar de categorías
// ---------------------------------------------------------------------------

describe('EditStepRetoques — sidebar de categorías', () => {
  it('should_render_a_button_per_category', () => {
    // Arrange
    const categories = [
      buildCategory(1, 'Retratos'),
      buildCategory(2, 'Paisajes'),
      buildCategory(3, 'Productos'),
    ]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<EditStepRetoques />)

    // Assert
    expect(screen.getByText('Retratos')).toBeInTheDocument()
    expect(screen.getByText('Paisajes')).toBeInTheDocument()
    expect(screen.getByText('Productos')).toBeInTheDocument()
  })

  it('should_render_no_category_buttons_when_categories_is_empty', () => {
    // Arrange
    mockContext({ categories: [], activeCategoryId: null })

    // Act
    render(<EditStepRetoques />)

    // Assert
    const categoryButtons = screen.queryAllByRole('button', { name: /Retratos|Paisajes|Productos/ })
    expect(categoryButtons).toHaveLength(0)
  })

  it('should_mark_active_category_button_with_accent_class', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<EditStepRetoques />)

    // Assert — el botón de la categoría activa tiene bg-accent
    const activeBtn = screen.getByText('Retratos').closest('button')!
    expect(activeBtn).toHaveClass('bg-accent')
  })

  it('should_not_mark_inactive_category_button_with_accent_class', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })

    // Act
    render(<EditStepRetoques />)

    // Assert — el botón de la categoría inactiva NO tiene bg-accent
    const inactiveBtn = screen.getByText('Paisajes').closest('button')!
    expect(inactiveBtn).not.toHaveClass('bg-accent')
  })

  it('should_call_setSelectedCategoryId_with_category_id_when_category_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const categories = [buildCategory(1, 'Retratos'), buildCategory(2, 'Paisajes')]
    mockContext({ categories, activeCategoryId: 1 })
    render(<EditStepRetoques />)

    // Act
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
    render(<EditStepRetoques />)

    // Act
    await user.click(screen.getByText('Retratos'))

    // Assert
    expect(mockSetSelectedCategoryId).toHaveBeenCalledWith(10)
  })
})

// ---------------------------------------------------------------------------
// Tests: ProductGrid
// ---------------------------------------------------------------------------

describe('EditStepRetoques — ProductGrid', () => {
  it('should_render_product_grid_when_active_category_is_set', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retratos')]
    mockContext({ categories, activeCategoryId: 1, activeBatchId: 1 })

    // Act
    render(<EditStepRetoques />)

    // Assert
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('should_not_render_product_grid_when_active_category_is_null', () => {
    // Arrange
    mockContext({ categories: [], activeCategoryId: null })

    // Act
    render(<EditStepRetoques />)

    // Assert
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })
})
