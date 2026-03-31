/**
 * Tests TDD (RED phase) para CategorySidebar actualizado
 *
 * CategorySidebar acepta dos modos de operación:
 *
 *   Modo A — grupos (nueva prop `categoryGroups: CategoryGroup[]`):
 *     Muestra un header por grupo seguido de los botones de sus categorías.
 *
 *   Modo B — lista plana (prop `categories: Category[]`, compatibilidad hacia atrás):
 *     Muestra los botones directamente, sin ningún header de grupo.
 *
 * En ambos modos:
 *   - La categoría activa tiene variant 'default' (o clase de resaltado)
 *   - Las inactivas tienen variant 'outline'
 *   - El clic en una categoría llama onCategorySelect con su id
 *
 * Comportamientos cubiertos:
 *   - should_render_group_headers_when_categoryGroups_provided
 *   - should_render_categories_under_correct_group_header
 *   - should_highlight_active_category_within_group
 *   - should_call_onCategorySelect_when_category_in_group_clicked
 *   - should_render_flat_list_when_only_categories_provided
 *   - should_highlight_active_category_in_flat_list
 *   - should_call_onCategorySelect_when_category_in_flat_list_clicked
 *   - should_render_no_group_headers_when_only_categories_provided
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CategorySidebar from '../CategorySidebar'
import type { Category, CategoryGroup } from '@/shared/types/category'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildCategory(id: number, name: string): Category {
  return { id, name }
}

function buildGroup(tag: string, label: string, categories: Category[]): CategoryGroup {
  return { tag, label, categories }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Modo grupos (categoryGroups prop)
// ---------------------------------------------------------------------------

describe('CategorySidebar — modo grupos (categoryGroups prop)', () => {
  it('should_render_group_headers_when_categoryGroups_provided', () => {
    // Arrange
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', [buildCategory(1, 'Retrato')]),
      buildGroup('opciones-de-entrega', 'Opciones de entrega', [buildCategory(2, 'Express')]),
      buildGroup('tiempo-de-entrega', 'Tiempo de entrega', [buildCategory(3, '24h')]),
    ]

    // Act
    render(
      <CategorySidebar
        categoryGroups={groups}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — los 3 headers de grupo son visibles
    expect(screen.getByText('Retoques')).toBeInTheDocument()
    expect(screen.getByText('Opciones de entrega')).toBeInTheDocument()
    expect(screen.getByText('Tiempo de entrega')).toBeInTheDocument()
  })

  it('should_render_categories_under_correct_group_header', () => {
    // Arrange
    const retoqueCategories = [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]
    const opcionesCategories = [buildCategory(3, 'Express'), buildCategory(4, 'Estándar')]
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', retoqueCategories),
      buildGroup('opciones-de-entrega', 'Opciones de entrega', opcionesCategories),
      buildGroup('tiempo-de-entrega', 'Tiempo de entrega', []),
    ]

    // Act
    render(
      <CategorySidebar
        categoryGroups={groups}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — todas las categorías de los grupos son visibles
    expect(screen.getByRole('button', { name: 'Retrato' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paisaje' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Express' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Estándar' })).toBeInTheDocument()
  })

  it('should_highlight_active_category_within_group', () => {
    // Arrange
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]),
    ]

    // Act
    render(
      <CategorySidebar categoryGroups={groups} activeCategoryId={1} onCategorySelect={vi.fn()} />,
    )

    // Assert — el botón de la categoría activa tiene data-active o variant default
    const activeBtn = screen.getByRole('button', { name: 'Retrato' })
    const inactiveBtn = screen.getByRole('button', { name: 'Paisaje' })

    // La categoría activa debe estar visualmente distinguida del resto.
    // Verificamos que NO tienen las mismas clases CSS (la activa tiene variant 'default').
    expect(activeBtn.className).not.toBe(inactiveBtn.className)
  })

  it('should_call_onCategorySelect_when_category_in_group_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onCategorySelect = vi.fn()
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', [
        buildCategory(10, 'Retrato'),
        buildCategory(20, 'Paisaje'),
      ]),
    ]

    render(
      <CategorySidebar
        categoryGroups={groups}
        activeCategoryId={10}
        onCategorySelect={onCategorySelect}
      />,
    )

    // Act
    await user.click(screen.getByRole('button', { name: 'Paisaje' }))

    // Assert
    expect(onCategorySelect).toHaveBeenCalledOnce()
    expect(onCategorySelect).toHaveBeenCalledWith(20)
  })

  it('should_render_empty_group_without_category_buttons', () => {
    // Arrange — un grupo vacío no debe renderizar botones
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', []),
      buildGroup('opciones-de-entrega', 'Opciones de entrega', [buildCategory(1, 'Express')]),
    ]

    // Act
    render(
      <CategorySidebar
        categoryGroups={groups}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — el header del grupo vacío aparece pero sin botones de categoría bajo él
    expect(screen.getByText('Retoques')).toBeInTheDocument()
    // El único botón existente pertenece al segundo grupo
    expect(screen.getAllByRole('button')).toHaveLength(1)
    expect(screen.getByRole('button', { name: 'Express' })).toBeInTheDocument()
  })

  it('should_render_all_category_buttons_from_all_groups', () => {
    // Arrange
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]),
      buildGroup('opciones-de-entrega', 'Opciones de entrega', [buildCategory(3, 'Express')]),
      buildGroup('tiempo-de-entrega', 'Tiempo de entrega', [
        buildCategory(4, '24h'),
        buildCategory(5, '48h'),
      ]),
    ]

    // Act
    render(
      <CategorySidebar
        categoryGroups={groups}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — 5 botones en total (2 + 1 + 2)
    expect(screen.getAllByRole('button')).toHaveLength(5)
  })
})

// ---------------------------------------------------------------------------
// Tests: Modo lista plana (categories prop, backwards compat)
// ---------------------------------------------------------------------------

describe('CategorySidebar — modo lista plana (categories prop)', () => {
  it('should_render_flat_list_when_only_categories_provided', () => {
    // Arrange
    const categories = [
      buildCategory(1, 'Retrato'),
      buildCategory(2, 'Paisaje'),
      buildCategory(3, 'Producto'),
    ]

    // Act
    render(
      <CategorySidebar
        categories={categories}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — las 3 categorías se renderizan como botones
    expect(screen.getByRole('button', { name: 'Retrato' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Paisaje' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Producto' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(3)
  })

  it('should_render_no_group_headers_when_only_categories_provided', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retrato')]

    // Act
    render(
      <CategorySidebar
        categories={categories}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — no hay ningún encabezado de grupo en el DOM
    expect(screen.queryByText('Retoques')).not.toBeInTheDocument()
    expect(screen.queryByText('Opciones de entrega')).not.toBeInTheDocument()
    expect(screen.queryByText('Tiempo de entrega')).not.toBeInTheDocument()
  })

  it('should_highlight_active_category_in_flat_list', () => {
    // Arrange
    const categories = [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]

    // Act
    render(
      <CategorySidebar categories={categories} activeCategoryId={1} onCategorySelect={vi.fn()} />,
    )

    // Assert — activa y no activa tienen clases distintas
    const activeBtn = screen.getByRole('button', { name: 'Retrato' })
    const inactiveBtn = screen.getByRole('button', { name: 'Paisaje' })
    expect(activeBtn.className).not.toBe(inactiveBtn.className)
  })

  it('should_call_onCategorySelect_when_category_in_flat_list_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onCategorySelect = vi.fn()
    const categories = [buildCategory(1, 'Retrato'), buildCategory(2, 'Paisaje')]

    render(
      <CategorySidebar
        categories={categories}
        activeCategoryId={1}
        onCategorySelect={onCategorySelect}
      />,
    )

    // Act
    await user.click(screen.getByRole('button', { name: 'Paisaje' }))

    // Assert
    expect(onCategorySelect).toHaveBeenCalledOnce()
    expect(onCategorySelect).toHaveBeenCalledWith(2)
  })

  it('should_render_no_buttons_when_categories_is_empty', () => {
    // Arrange
    render(<CategorySidebar categories={[]} activeCategoryId={null} onCategorySelect={vi.fn()} />)

    // Assert
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Tests: Prioridad de props (categoryGroups tiene precedencia sobre categories)
// ---------------------------------------------------------------------------

describe('CategorySidebar — prioridad de props', () => {
  it('should_prefer_categoryGroups_over_categories_when_both_provided', () => {
    // Arrange — si se pasan ambas props, categoryGroups tiene precedencia
    const groups: CategoryGroup[] = [
      buildGroup('retoque', 'Retoques', [buildCategory(1, 'Retrato')]),
    ]
    const categories = [buildCategory(99, 'Categoria plana')]

    // Act
    render(
      <CategorySidebar
        categoryGroups={groups}
        categories={categories}
        activeCategoryId={null}
        onCategorySelect={vi.fn()}
      />,
    )

    // Assert — se muestra el header de grupo (modo grupos activo)
    expect(screen.getByText('Retoques')).toBeInTheDocument()
    // La categoría plana que no pertenece a ningún grupo no se muestra
    expect(screen.queryByRole('button', { name: 'Categoria plana' })).not.toBeInTheDocument()
  })
})
