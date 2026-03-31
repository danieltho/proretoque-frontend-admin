/**
 * Tests TDD — BatchCreateStepProducts (fase RED)
 *
 * BatchCreateStepProducts es el componente presentacional del paso 2.
 * Props:
 *   categories: Category[]
 *   activeCategoryId: number | null
 *   onCategorySelect: (id: number) => void
 *   selectedProducts: Record<number, number>
 *   onItemSelect: (productId: number, itemId: number | null) => void
 *   onClearProducts: () => void
 *   onSubmit: () => void
 *   onBack: () => void
 *   submitting: boolean
 *
 * Comportamientos cubiertos:
 *   - Renderiza el componente CategorySidebar (o lista de categorías)
 *   - Renderiza el componente ProductGrid cuando hay categoría activa
 *   - No renderiza ProductGrid cuando activeCategoryId es null
 *   - Botón "Crear lote" llama onSubmit
 *   - Botón "Volver" llama onBack
 *   - Botón "Crear lote" disabled cuando submitting=true
 *   - Botón "Crear lote" enabled cuando submitting=false
 *   - Muestra el texto "Crear lote" en el botón de submit
 *
 * CategorySidebar y ProductGrid se mockean para aislar el componente.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BatchCreateStepProducts from '../components/BatchCreateStepProducts'
import type { Category } from '@/shared/types/category'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos
// ---------------------------------------------------------------------------

vi.mock('@/features/orders/components/CategorySidebar', () => ({
  default: (props: {
    categories: Category[]
    activeCategoryId: number | null
    onCategorySelect: (id: number) => void
  }) => (
    <div data-testid="category-sidebar">
      {props.categories.map((c) => (
        <button
          key={c.id}
          data-testid={`category-btn-${c.id}`}
          onClick={() => props.onCategorySelect(c.id)}
          className={props.activeCategoryId === c.id ? 'active' : ''}
        >
          {c.name}
        </button>
      ))}
    </div>
  ),
}))

vi.mock('@/features/orders/components/ProductGrid', () => ({
  default: (props: {
    categoryId: number
    selectedProducts: Record<number, number[]>
    onItemSelect: (productId: number, itemIds: number[]) => void
  }) => (
    <div data-testid="product-grid" data-category-id={props.categoryId}>
      ProductGrid
    </div>
  ),
}))

vi.mock('@/features/orders/components/SelectedProductsSummary', () => ({
  default: (props: { selectedProducts: Record<number, number[]>; onClear: () => void }) => (
    <div data-testid="selected-products-summary">
      <span data-testid="selected-count">{Object.keys(props.selectedProducts).length}</span>
      <button data-testid="clear-products-btn" onClick={props.onClear}>
        Limpiar
      </button>
    </div>
  ),
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockCategories: Category[] = [
  { id: 1, name: 'Retratos' },
  { id: 2, name: 'Paisajes' },
]

interface RenderProps {
  categories?: Category[]
  activeCategoryId?: number | null
  onCategorySelect?: (id: number) => void
  selectedProducts?: Record<number, number[]>
  onItemSelect?: (productId: number, itemIds: number[]) => void
  onClearProducts?: () => void
  onSubmit?: () => void
  onBack?: () => void
  submitting?: boolean
}

function renderComponent(props: RenderProps = {}) {
  const defaults: Required<RenderProps> = {
    categories: mockCategories,
    activeCategoryId: null,
    onCategorySelect: vi.fn(),
    selectedProducts: {},
    onItemSelect: vi.fn(),
    onClearProducts: vi.fn(),
    onSubmit: vi.fn(),
    onBack: vi.fn(),
    submitting: false,
  }
  return render(<BatchCreateStepProducts {...defaults} {...props} />)
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: CategorySidebar
// ---------------------------------------------------------------------------

describe('BatchCreateStepProducts — CategorySidebar', () => {
  it('should_render_category_sidebar', () => {
    // Arrange & Act
    renderComponent()

    // Assert — el sidebar de categorías está presente
    expect(screen.getByTestId('category-sidebar')).toBeInTheDocument()
  })

  it('should_render_a_button_for_each_category', () => {
    // Arrange & Act
    renderComponent({ categories: mockCategories })

    // Assert — un botón por cada categoría
    expect(screen.getByTestId('category-btn-1')).toBeInTheDocument()
    expect(screen.getByTestId('category-btn-2')).toBeInTheDocument()
    expect(screen.getByText('Retratos')).toBeInTheDocument()
    expect(screen.getByText('Paisajes')).toBeInTheDocument()
  })

  it('should_call_onCategorySelect_when_category_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onCategorySelect = vi.fn()
    renderComponent({ onCategorySelect })

    // Act
    await user.click(screen.getByTestId('category-btn-1'))

    // Assert
    expect(onCategorySelect).toHaveBeenCalledWith(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: ProductGrid (condicional)
// ---------------------------------------------------------------------------

describe('BatchCreateStepProducts — ProductGrid', () => {
  it('should_not_render_product_grid_when_activeCategoryId_is_null', () => {
    // Arrange & Act
    renderComponent({ activeCategoryId: null })

    // Assert
    expect(screen.queryByTestId('product-grid')).not.toBeInTheDocument()
  })

  it('should_render_product_grid_when_activeCategoryId_is_set', () => {
    // Arrange & Act
    renderComponent({ activeCategoryId: 1 })

    // Assert
    expect(screen.getByTestId('product-grid')).toBeInTheDocument()
  })

  it('should_pass_activeCategoryId_to_product_grid', () => {
    // Arrange & Act
    renderComponent({ activeCategoryId: 2 })

    // Assert — el grid recibe el categoryId correcto
    expect(screen.getByTestId('product-grid')).toHaveAttribute('data-category-id', '2')
  })
})

// ---------------------------------------------------------------------------
// Tests: Botones de acción
// ---------------------------------------------------------------------------

describe('BatchCreateStepProducts — botones de acción', () => {
  it('should_render_crear_lote_button', () => {
    // Arrange & Act
    renderComponent()

    // Assert
    expect(screen.getByRole('button', { name: /crear lote/i })).toBeInTheDocument()
  })

  it('should_render_volver_button', () => {
    // Arrange & Act
    renderComponent()

    // Assert
    expect(screen.getByRole('button', { name: /volver/i })).toBeInTheDocument()
  })

  it('should_call_onSubmit_when_crear_lote_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    renderComponent({ onSubmit })

    // Act
    await user.click(screen.getByRole('button', { name: /crear lote/i }))

    // Assert
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('should_call_onBack_when_volver_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onBack = vi.fn()
    renderComponent({ onBack })

    // Act
    await user.click(screen.getByRole('button', { name: /volver/i }))

    // Assert
    expect(onBack).toHaveBeenCalledTimes(1)
  })

  it('should_disable_crear_lote_button_when_submitting_is_true', () => {
    // Arrange & Act
    renderComponent({ submitting: true })

    // Assert
    expect(screen.getByRole('button', { name: /crear lote|creando/i })).toBeDisabled()
  })

  it('should_enable_crear_lote_button_when_submitting_is_false', () => {
    // Arrange & Act
    renderComponent({ submitting: false })

    // Assert
    expect(screen.getByRole('button', { name: /crear lote/i })).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests: SelectedProductsSummary
// ---------------------------------------------------------------------------

describe('BatchCreateStepProducts — SelectedProductsSummary', () => {
  it('should_render_selected_products_summary', () => {
    // Arrange & Act
    renderComponent()

    // Assert — el resumen de selección siempre está visible
    expect(screen.getByTestId('selected-products-summary')).toBeInTheDocument()
  })

  it('should_show_correct_selected_product_count', () => {
    // Arrange & Act
    renderComponent({ selectedProducts: { 1: [100], 2: [200], 3: [300] } })

    // Assert — 3 productos seleccionados
    expect(screen.getByTestId('selected-count')).toHaveTextContent('3')
  })

  it('should_call_onClearProducts_when_clear_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClearProducts = vi.fn()
    renderComponent({ selectedProducts: { 1: [100] }, onClearProducts })

    // Act
    await user.click(screen.getByTestId('clear-products-btn'))

    // Assert
    expect(onClearProducts).toHaveBeenCalledTimes(1)
  })
})
