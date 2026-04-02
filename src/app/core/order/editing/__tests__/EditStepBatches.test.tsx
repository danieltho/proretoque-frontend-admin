/**
 * Tests TDD para EditStepBatches
 *
 * EditStepBatches consume useOrderEdit() para acceder a:
 * - activeBatch: lote activo (condiciona el renderizado de vistas)
 * - viewMode / setViewMode: alternar entre vista grid y lista
 *
 * EditStepBatches renderiza como hijos:
 * - <EditBatchTabs /> siempre
 * - Toggle de vista (botones grid/lista) cuando hay activeBatch
 * - <MediaGridView /> cuando viewMode es 'grid' y hay activeBatch
 * - <MediaListView /> cuando viewMode es 'list' y hay activeBatch
 * - Conteo de archivos del batch activo cuando hay activeBatch
 *
 * Comportamientos cubiertos:
 * - Renderiza EditBatchTabs siempre
 * - Renderiza el toggle de vista cuando hay activeBatch
 * - No renderiza el toggle de vista sin activeBatch
 * - Renderiza MediaGridView cuando viewMode es 'grid' y hay activeBatch
 * - Renderiza MediaListView cuando viewMode es 'list' y hay activeBatch
 * - No renderiza MediaGridView ni MediaListView sin activeBatch
 * - Muestra conteo singular de imagen cuando activeBatch.media tiene 1 elemento
 * - Muestra conteo plural de imagenes cuando activeBatch.media tiene mas de 1 elemento
 * - Muestra conteo cero cuando activeBatch.media esta vacio
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditStepBatches from '../components/EditStepBatches'
import type { EditableBatch } from '../../types/order'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderEditContext', () => ({
  useOrderEdit: vi.fn(),
}))

import { useOrderEdit } from '../context/OrderEditContext'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos para aislar EditStepBatches
// ---------------------------------------------------------------------------

vi.mock('../components/EditBatchTabs', () => ({
  default: () => <div data-testid="edit-batch-tabs">EditBatchTabs</div>,
}))

vi.mock('../components/MediaGridView', () => ({
  default: () => <div data-testid="media-grid-view">MediaGridView</div>,
}))

vi.mock('../components/MediaListView', () => ({
  default: () => <div data-testid="media-list-view">MediaListView</div>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildEditableBatch(overrides: Partial<EditableBatch> = {}): EditableBatch {
  return {
    id: 1,
    name: 'Lote 1',
    status: 'pending',
    files_size: 2048,
    files_count: 3,
    media: [],
    products: {},
    newFiles: [],
    newPreviews: [],
    ...overrides,
  }
}

function buildMedia(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    file_name: `foto-${i + 1}.jpg`,
    size: 1024,
    url: `https://example.com/foto-${i + 1}.jpg`,
  }))
}

const mockSetViewMode = vi.fn()

function mockContext(overrides: { activeBatch?: EditableBatch; viewMode?: 'grid' | 'list' }) {
  vi.mocked(useOrderEdit).mockReturnValue({
    activeBatch: overrides.activeBatch,
    viewMode: overrides.viewMode ?? 'list',
    setViewMode: mockSetViewMode,
  } as unknown as ReturnType<typeof useOrderEdit>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado de EditBatchTabs
// ---------------------------------------------------------------------------

describe('EditStepBatches — EditBatchTabs', () => {
  it('should_render_edit_batch_tabs_always', () => {
    // Arrange
    mockContext({ activeBatch: undefined })

    // Act
    render(<EditStepBatches />)

    // Assert
    expect(screen.getByTestId('edit-batch-tabs')).toBeInTheDocument()
  })

  it('should_render_edit_batch_tabs_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch() })

    // Act
    render(<EditStepBatches />)

    // Assert
    expect(screen.getByTestId('edit-batch-tabs')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Toggle de vista (grid / lista)
// ---------------------------------------------------------------------------

describe('EditStepBatches — toggle de vista', () => {
  it('should_render_view_toggle_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch() })

    // Act
    render(<EditStepBatches />)

    // Assert — hay al menos 2 botones de vista
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should_not_render_view_toggle_when_active_batch_is_undefined', () => {
    // Arrange
    mockContext({ activeBatch: undefined })

    // Act
    render(<EditStepBatches />)

    // Assert — sin activeBatch no hay botones de vista ni vistas de medios
    expect(screen.queryByTestId('media-grid-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('media-list-view')).not.toBeInTheDocument()
  })

  it('should_call_setViewMode_with_grid_when_grid_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({ activeBatch: buildEditableBatch(), viewMode: 'list' })
    render(<EditStepBatches />)

    // Act — primer boton de vista es grid
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[0])

    // Assert
    expect(mockSetViewMode).toHaveBeenCalledWith('grid')
  })

  it('should_call_setViewMode_with_list_when_list_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    mockContext({ activeBatch: buildEditableBatch(), viewMode: 'grid' })
    render(<EditStepBatches />)

    // Act — segundo boton de vista es lista
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[1])

    // Assert
    expect(mockSetViewMode).toHaveBeenCalledWith('list')
  })
})

// ---------------------------------------------------------------------------
// Tests: Renderizado condicional de MediaGridView / MediaListView
// ---------------------------------------------------------------------------

describe('EditStepBatches — renderizado de vistas de medios', () => {
  it('should_render_media_grid_view_when_viewMode_is_grid', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch(), viewMode: 'grid' })

    // Act
    render(<EditStepBatches />)

    // Assert
    expect(screen.getByTestId('media-grid-view')).toBeInTheDocument()
    expect(screen.queryByTestId('media-list-view')).not.toBeInTheDocument()
  })

  it('should_render_media_list_view_when_viewMode_is_list', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch(), viewMode: 'list' })

    // Act
    render(<EditStepBatches />)

    // Assert
    expect(screen.getByTestId('media-list-view')).toBeInTheDocument()
    expect(screen.queryByTestId('media-grid-view')).not.toBeInTheDocument()
  })

  it('should_not_render_any_media_view_when_active_batch_is_undefined', () => {
    // Arrange
    mockContext({ activeBatch: undefined })

    // Act
    render(<EditStepBatches />)

    // Assert
    expect(screen.queryByTestId('media-grid-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('media-list-view')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Conteo de archivos del batch activo
// ---------------------------------------------------------------------------

describe('EditStepBatches — conteo de archivos', () => {
  it('should_show_singular_imagen_when_active_batch_has_one_media', () => {
    // Arrange
    const batch = buildEditableBatch({ media: buildMedia(1) })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepBatches />)

    // Assert — "1 imagen" (singular)
    expect(screen.getByText(/1 imagen/)).toBeInTheDocument()
  })

  it('should_show_plural_imagenes_when_active_batch_has_multiple_media', () => {
    // Arrange
    const batch = buildEditableBatch({ media: buildMedia(5) })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepBatches />)

    // Assert — "5 imágenes" (plural)
    expect(screen.getByText(/5 imágenes/)).toBeInTheDocument()
  })

  it('should_show_zero_imagenes_when_active_batch_has_no_media', () => {
    // Arrange
    const batch = buildEditableBatch({ media: [] })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepBatches />)

    // Assert — "0 imágenes" (plural)
    expect(screen.getByText(/0 imágenes/)).toBeInTheDocument()
  })

  it('should_not_show_file_count_when_active_batch_is_undefined', () => {
    // Arrange
    mockContext({ activeBatch: undefined })

    // Act
    render(<EditStepBatches />)

    // Assert — sin batch activo no hay texto de conteo
    expect(screen.queryByText(/imagen/)).not.toBeInTheDocument()
  })
})
