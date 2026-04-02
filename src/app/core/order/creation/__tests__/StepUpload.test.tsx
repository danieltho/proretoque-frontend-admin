/**
 * Tests TDD para StepUpload
 *
 * StepUpload consume useOrderForm() para acceder a:
 * - activeBatch: lote activo (muestra DropZone y contador de archivos)
 * - viewMode / setViewMode: alternar entre vista grid y lista
 *
 * StepUpload renderiza como hijos:
 * - <BatchTabs showRename showRemove />
 * - <DropZone />
 * - <FileGridView /> o <FileListView /> cuando hay archivos
 *
 * El contexto se mockea a nivel de modulo para aislar el componente.
 * BatchTabs, DropZone, FileGridView y FileListView se mockean tambien
 * para aislar StepUpload de sus dependencias internas.
 *
 * Comportamientos cubiertos:
 * - Renderiza el area de drop zone (DropZone esta montado)
 * - Renderiza BatchTabs con props showRename y showRemove
 * - No muestra la barra de informacion ni las vistas cuando no hay archivos
 * - Muestra cantidad de imagenes cuando el lote tiene archivos
 * - Muestra el tamano total de los archivos
 * - Muestra el texto "imagen" (singular) cuando hay exactamente 1 archivo
 * - Muestra el texto "imagenes" (plural) cuando hay mas de 1 archivo
 * - Muestra los botones de vista grid y lista cuando hay archivos
 * - El boton de vista grid llama setViewMode con 'grid'
 * - El boton de vista lista llama setViewMode con 'list'
 * - Renderiza FileListView cuando viewMode es 'list' y hay archivos
 * - Renderiza FileGridView cuando viewMode es 'grid' y hay archivos
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import StepUpload from '../components/StepUpload'
import type { LocalBatch } from '../../types/batch'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

import { useOrderForm } from '../context/OrderFormContext'

// ---------------------------------------------------------------------------
// Mocks de componentes hijos para aislar StepUpload
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

vi.mock('../components/DropZone', () => ({
  default: () => <div data-testid="drop-zone">DropZone</div>,
}))

vi.mock('../components/FileGridView', () => ({
  default: () => <div data-testid="file-grid-view">FileGridView</div>,
}))

vi.mock('../components/FileListView', () => ({
  default: () => <div data-testid="file-list-view">FileListView</div>,
}))

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildBatch(overrides: Partial<LocalBatch> = {}): LocalBatch {
  return {
    id: 'batch-1',
    name: 'Lote 1',
    files: [],
    previews: [],
    products: {},
    deliveryOptions: {
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
    },
    ...overrides,
  }
}

function createMockFile(name: string, sizeBytes = 1024): File {
  const file = new File(['x'.repeat(sizeBytes)], name, { type: 'image/jpeg' })
  return file
}

const mockSetViewMode = vi.fn()

function mockContext(activeBatch: LocalBatch | undefined, viewMode: 'grid' | 'list' = 'list') {
  vi.mocked(useOrderForm).mockReturnValue({
    activeBatch,
    viewMode,
    setViewMode: mockSetViewMode,
    canAdvanceFromCurrentStep: true,
  } as unknown as ReturnType<typeof useOrderForm>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado de componentes hijos
// ---------------------------------------------------------------------------

describe('StepUpload — renderizado de componentes hijos', () => {
  it('should_render_batch_tabs_always', () => {
    // Arrange
    mockContext(buildBatch())

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.getByTestId('batch-tabs')).toBeInTheDocument()
  })

  it('should_pass_showRename_true_to_batch_tabs', () => {
    // Arrange
    mockContext(buildBatch())

    // Act
    render(<StepUpload />)

    // Assert — StepUpload pasa showRename al BatchTabs
    const batchTabs = screen.getByTestId('batch-tabs')
    expect(batchTabs).toHaveAttribute('data-show-rename', 'true')
  })

  it('should_pass_showRemove_true_to_batch_tabs', () => {
    // Arrange
    mockContext(buildBatch())

    // Act
    render(<StepUpload />)

    // Assert — StepUpload pasa showRemove al BatchTabs
    const batchTabs = screen.getByTestId('batch-tabs')
    expect(batchTabs).toHaveAttribute('data-show-remove', 'true')
  })

  it('should_render_drop_zone_when_active_batch_exists', () => {
    // Arrange
    mockContext(buildBatch())

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.getByTestId('drop-zone')).toBeInTheDocument()
  })

  it('should_not_render_drop_zone_when_active_batch_is_undefined', () => {
    // Arrange
    mockContext(undefined)

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.queryByTestId('drop-zone')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Contador de archivos (solo visible con archivos)
// ---------------------------------------------------------------------------

describe('StepUpload — informacion de archivos', () => {
  it('should_not_show_file_count_when_batch_has_no_files', () => {
    // Arrange
    mockContext(buildBatch({ files: [] }))

    // Act
    render(<StepUpload />)

    // Assert — sin archivos no debe haber texto de conteo
    expect(screen.queryByText(/imagen/)).not.toBeInTheDocument()
  })

  it('should_show_singular_imagen_when_batch_has_exactly_one_file', () => {
    // Arrange
    const file = createMockFile('foto.jpg')
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }))

    // Act
    render(<StepUpload />)

    // Assert — 1 imagen (singular)
    expect(screen.getByText(/1 imagen/)).toBeInTheDocument()
  })

  it('should_show_plural_imagenes_when_batch_has_multiple_files', () => {
    // Arrange
    const files = [createMockFile('a.jpg'), createMockFile('b.jpg')]
    mockContext(buildBatch({ files, previews: ['blob:1', 'blob:2'] }))

    // Act
    render(<StepUpload />)

    // Assert — 2 imagenes (plural)
    expect(screen.getByText(/2 imágenes/)).toBeInTheDocument()
  })

  it('should_show_file_size_summary_when_batch_has_files', () => {
    // Arrange — un archivo de exactamente 1024 bytes = 1.0 KB
    const file = createMockFile('foto.jpg', 1024)
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }))

    // Act
    render(<StepUpload />)

    // Assert — debe mostrar el tamaño formateado (formatSize de batch.ts)
    // Usamos getAllByText y verificamos que al menos uno coincide con un tamaño
    const matches = screen.getAllByText(/\d+(\.\d+)?\s*(KB|MB|B)/)
    expect(matches.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Tests: Botones de modo de vista
// ---------------------------------------------------------------------------

describe('StepUpload — botones de vista grid y lista', () => {
  it('should_not_show_view_toggle_buttons_when_batch_has_no_files', () => {
    // Arrange
    mockContext(buildBatch({ files: [] }))

    // Act
    render(<StepUpload />)

    // Assert — sin archivos no hay botones de vista
    expect(screen.queryByTestId('file-grid-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('file-list-view')).not.toBeInTheDocument()
  })

  it('should_show_view_toggle_buttons_when_batch_has_files', () => {
    // Arrange
    const file = createMockFile('foto.jpg')
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }))

    // Act
    render(<StepUpload />)

    // Assert — con archivos deben existir los botones de alternancia de vista
    const buttons = screen.getAllByRole('button')
    // Hay al menos 2 botones de vista (grid y list)
    expect(buttons.length).toBeGreaterThanOrEqual(2)
  })

  it('should_call_setViewMode_with_grid_when_grid_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const file = createMockFile('foto.jpg')
    // viewMode actual = 'list', para que el boton de grid este disponible
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }), 'list')

    render(<StepUpload />)

    // Act — el primer boton de vista es el de grid (LayoutGrid)
    // En el componente real los botones tienen iconos SVG de lucide-react
    // Usamos getAllByRole('button') y hacemos click en el de grid (index 0 de los de vista)
    const allButtons = screen.getAllByRole('button')
    // El primer boton de vista es "grid" segun el pedido en StepUpload
    await user.click(allButtons[0])

    // Assert
    expect(mockSetViewMode).toHaveBeenCalledWith('grid')
  })

  it('should_call_setViewMode_with_list_when_list_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const file = createMockFile('foto.jpg')
    // viewMode actual = 'grid', para que el boton de list este visible
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }), 'grid')

    render(<StepUpload />)

    // Act — el segundo boton de vista es el de lista (List)
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[1])

    // Assert
    expect(mockSetViewMode).toHaveBeenCalledWith('list')
  })
})

// ---------------------------------------------------------------------------
// Tests: Renderizado condicional de vistas de archivos
// ---------------------------------------------------------------------------

describe('StepUpload — renderizado de FileGridView y FileListView', () => {
  it('should_render_file_list_view_when_viewMode_is_list_and_files_exist', () => {
    // Arrange
    const file = createMockFile('foto.jpg')
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }), 'list')

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.getByTestId('file-list-view')).toBeInTheDocument()
    expect(screen.queryByTestId('file-grid-view')).not.toBeInTheDocument()
  })

  it('should_render_file_grid_view_when_viewMode_is_grid_and_files_exist', () => {
    // Arrange
    const file = createMockFile('foto.jpg')
    mockContext(buildBatch({ files: [file], previews: ['blob:1'] }), 'grid')

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.getByTestId('file-grid-view')).toBeInTheDocument()
    expect(screen.queryByTestId('file-list-view')).not.toBeInTheDocument()
  })

  it('should_not_render_any_file_view_when_batch_is_empty', () => {
    // Arrange
    mockContext(buildBatch({ files: [] }), 'list')

    // Act
    render(<StepUpload />)

    // Assert
    expect(screen.queryByTestId('file-list-view')).not.toBeInTheDocument()
    expect(screen.queryByTestId('file-grid-view')).not.toBeInTheDocument()
  })
})
