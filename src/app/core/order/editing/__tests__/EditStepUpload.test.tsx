/**
 * Tests TDD para EditStepUpload
 *
 * EditStepUpload consume useOrderEdit() para acceder a:
 * - activeBatch: lote activo (newFiles, newPreviews, name)
 * - handleFiles / removeNewFile: gestión de archivos nuevos
 * - validationErrors: errores de validación de archivos
 *
 * EditStepUpload renderiza como hijos:
 * - <EditBatchTabs /> siempre
 * - Zona de drop (drop zone) cuando hay activeBatch
 * - Preview de archivos nuevos (lista) cuando activeBatch.newFiles tiene elementos
 * - Mensaje de validationErrors cuando hay errores
 *
 * Comportamientos cubiertos:
 * - Renderiza EditBatchTabs siempre
 * - Renderiza la zona de drop cuando hay activeBatch
 * - Muestra preview de archivos nuevos cuando activeBatch tiene newFiles
 * - No muestra preview de archivos cuando newFiles está vacío
 * - Muestra validationErrors cuando hay errores de validación
 * - No muestra sección de errores cuando validationErrors está vacío
 * - Muestra conteo de archivos nuevos (singular y plural)
 */

import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditStepUpload from '../components/EditStepUpload'
import type { EditableBatch } from '../../types/order'

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

function makeFile(name: string, size = 1024): File {
  const file = new File([new Blob(['x'])], name, { type: 'image/jpeg' })
  Object.defineProperty(file, 'size', { value: size, configurable: true })
  return file
}

const mockHandleFiles = vi.fn()
const mockRemoveNewFile = vi.fn()

function mockContext(overrides: { activeBatch?: EditableBatch; validationErrors?: string[] }) {
  vi.mocked(useOrderEdit).mockReturnValue({
    activeBatch: overrides.activeBatch,
    handleFiles: mockHandleFiles,
    removeNewFile: mockRemoveNewFile,
    validationErrors: overrides.validationErrors ?? [],
  } as unknown as ReturnType<typeof useOrderEdit>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: EditBatchTabs
// ---------------------------------------------------------------------------

describe('EditStepUpload — EditBatchTabs', () => {
  it('should_render_edit_batch_tabs_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch() })

    // Act
    render(<EditStepUpload />)

    // Assert
    expect(screen.getByTestId('edit-batch-tabs')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Zona de drop
// ---------------------------------------------------------------------------

describe('EditStepUpload — zona de drop', () => {
  it('should_render_drop_zone_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch() })

    // Act
    render(<EditStepUpload />)

    // Assert — la zona de drop tiene texto descriptivo
    expect(screen.getByText(/Arrastra archivos aquí/i)).toBeInTheDocument()
  })

  it('should_render_file_input_when_active_batch_exists', () => {
    // Arrange
    mockContext({ activeBatch: buildEditableBatch() })

    // Act
    render(<EditStepUpload />)

    // Assert — existe un input de tipo file
    const fileInput = document.querySelector('input[type="file"]')
    expect(fileInput).not.toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Tests: Preview de archivos nuevos
// ---------------------------------------------------------------------------

describe('EditStepUpload — preview de archivos nuevos', () => {
  it('should_show_new_files_preview_when_active_batch_has_new_files', () => {
    // Arrange
    const newFiles = [makeFile('foto1.jpg'), makeFile('foto2.jpg')]
    const newPreviews = ['blob:preview-1', 'blob:preview-2']
    const batch = buildEditableBatch({ newFiles, newPreviews })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepUpload />)

    // Assert — los nombres de archivos nuevos aparecen en el DOM
    expect(screen.getByText('foto1.jpg')).toBeInTheDocument()
    expect(screen.getByText('foto2.jpg')).toBeInTheDocument()
  })

  it('should_not_show_file_preview_when_active_batch_has_no_new_files', () => {
    // Arrange
    const batch = buildEditableBatch({ newFiles: [], newPreviews: [] })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepUpload />)

    // Assert — no aparece ningún nombre de archivo
    expect(screen.queryByText('foto1.jpg')).not.toBeInTheDocument()
  })

  it('should_show_singular_nueva_when_one_new_file', () => {
    // Arrange
    const newFiles = [makeFile('foto1.jpg')]
    const newPreviews = ['blob:preview-1']
    const batch = buildEditableBatch({ newFiles, newPreviews })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepUpload />)

    // Assert — "1 imagen nueva" (singular)
    expect(screen.getByText(/1 imagen nueva/)).toBeInTheDocument()
  })

  it('should_show_plural_nuevas_when_multiple_new_files', () => {
    // Arrange
    const newFiles = [makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg')]
    const newPreviews = ['blob:1', 'blob:2', 'blob:3']
    const batch = buildEditableBatch({ newFiles, newPreviews })
    mockContext({ activeBatch: batch })

    // Act
    render(<EditStepUpload />)

    // Assert — "3 imágenes nuevas" (plural)
    expect(screen.getByText(/3 imágenes nuevas/)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: validationErrors
// ---------------------------------------------------------------------------

describe('EditStepUpload — validationErrors', () => {
  it('should_show_validation_errors_when_there_are_errors', () => {
    // Arrange
    const errors = ['El archivo "huge.tif" supera el límite de 50 MB']
    mockContext({
      activeBatch: buildEditableBatch(),
      validationErrors: errors,
    })

    // Act
    render(<EditStepUpload />)

    // Assert — el mensaje de error aparece en el DOM
    expect(screen.getByText('El archivo "huge.tif" supera el límite de 50 MB')).toBeInTheDocument()
  })

  it('should_show_multiple_validation_errors_when_there_are_several', () => {
    // Arrange
    const errors = ['Error de tipo en "doc.pdf"', 'Error de tamaño en "big.jpg"']
    mockContext({
      activeBatch: buildEditableBatch(),
      validationErrors: errors,
    })

    // Act
    render(<EditStepUpload />)

    // Assert — ambos errores aparecen
    expect(screen.getByText('Error de tipo en "doc.pdf"')).toBeInTheDocument()
    expect(screen.getByText('Error de tamaño en "big.jpg"')).toBeInTheDocument()
  })

  it('should_not_show_error_section_when_validationErrors_is_empty', () => {
    // Arrange
    mockContext({
      activeBatch: buildEditableBatch(),
      validationErrors: [],
    })

    // Act
    render(<EditStepUpload />)

    // Assert — sin errores no aparece ningún mensaje de error de validación
    expect(screen.queryByText(/supera el límite/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Error de tipo/)).not.toBeInTheDocument()
  })
})
