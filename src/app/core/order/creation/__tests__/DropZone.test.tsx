/**
 * Tests TDD para DropZone
 *
 * DropZone consume useOrderForm() para acceder a:
 * - activeBatch: determina si renderiza (null = no renderiza)
 * - handleFiles: callback al soltar o seleccionar archivos
 *
 * El contexto se mockea para aislar el componente de la infraestructura.
 *
 * Comportamientos cubiertos:
 * - No renderiza nada si activeBatch es undefined/null
 * - Muestra zona de drop con texto "Arrastra imagenes aqui" cuando no hay archivos
 * - Muestra texto "Agregar mas imagenes" cuando el batch ya tiene archivos
 * - Tiene un input file oculto que acepta "image/*"
 * - Llama handleFiles al soltar archivos (evento drop)
 * - Llama handleFiles al seleccionar via el input file
 */

import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import DropZone from '../components/DropZone'

// ---------------------------------------------------------------------------
// Mock del contexto — DropZone solo usa activeBatch y handleFiles
// ---------------------------------------------------------------------------

const mockHandleFiles = vi.fn()

vi.mock('../context/OrderFormContext', () => ({
  useOrderForm: vi.fn(),
}))

import { useOrderForm } from '../context/OrderFormContext'

// Helper para configurar el mock del contexto antes de cada test
function mockContext(overrides: {
  activeBatch?: {
    id: string
    name: string
    files: File[]
    previews: string[]
    products: Record<number, number[]>
  } | null
  handleFiles?: (files: FileList | null) => void
}) {
  vi.mocked(useOrderForm).mockReturnValue({
    activeBatch: overrides.activeBatch ?? null,
    handleFiles: overrides.handleFiles ?? mockHandleFiles,
  } as ReturnType<typeof useOrderForm>)
}

const EMPTY_BATCH = {
  id: 'batch-1',
  name: 'Lote 1',
  files: [],
  previews: [],
  products: {},
  deliveryOptions: {
    deliveryTime: '72hs' as const,
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
}

function createMockFile(name: string, type: string): File {
  return new File(['content'], name, { type })
}

// ---------------------------------------------------------------------------
// Tests: Renderizado condicional
// ---------------------------------------------------------------------------

describe('DropZone — renderizado condicional', () => {
  it('should_render_nothing_when_activeBatch_is_null', () => {
    // Arrange
    mockContext({ activeBatch: null })

    // Act
    const { container } = render(<DropZone />)

    // Assert — el componente devuelve null
    expect(container.firstChild).toBeNull()
  })

  it('should_render_dropzone_when_activeBatch_exists', () => {
    // Arrange
    mockContext({ activeBatch: EMPTY_BATCH })

    // Act
    render(<DropZone />)

    // Assert
    expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Texto segun estado de archivos
// ---------------------------------------------------------------------------

describe('DropZone — texto segun estado de archivos', () => {
  it('should_show_drag_prompt_when_batch_has_no_files', () => {
    // Arrange
    mockContext({ activeBatch: EMPTY_BATCH })

    // Act
    render(<DropZone />)

    // Assert
    expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument()
    expect(screen.getByText('o haz clic para seleccionar archivos')).toBeInTheDocument()
  })

  it('should_show_add_more_prompt_when_batch_already_has_files', () => {
    // Arrange
    const batchWithFiles = {
      ...EMPTY_BATCH,
      files: [createMockFile('foto.jpg', 'image/jpeg')],
    }
    mockContext({ activeBatch: batchWithFiles })

    // Act
    render(<DropZone />)

    // Assert
    expect(screen.getByText('Agregar archivos aquí')).toBeInTheDocument()
    // El texto secundario no debe aparecer cuando ya hay archivos
    expect(screen.queryByText('o haz clic para seleccionar archivos')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Input file oculto
// ---------------------------------------------------------------------------

describe('DropZone — input file', () => {
  it('should_have_hidden_file_input_that_accepts_images', () => {
    // Arrange
    mockContext({ activeBatch: EMPTY_BATCH })

    // Act
    render(<DropZone />)

    // Assert — el input debe existir y aceptar solo imagenes
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute('accept', 'image/*')
    expect(input).toHaveAttribute('multiple')
  })

  it('should_call_handleFiles_when_files_selected_via_input', () => {
    // Arrange
    const handleFiles = vi.fn()
    mockContext({ activeBatch: EMPTY_BATCH, handleFiles })

    render(<DropZone />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile('foto.jpg', 'image/jpeg')

    // Act — simular seleccion de archivo via input
    fireEvent.change(input, { target: { files: [file] } })

    // Assert
    expect(handleFiles).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Drag & Drop
// ---------------------------------------------------------------------------

describe('DropZone — drag and drop', () => {
  it('should_call_handleFiles_with_dropped_files_when_drop_event_fires', () => {
    // Arrange
    const handleFiles = vi.fn()
    mockContext({ activeBatch: EMPTY_BATCH, handleFiles })

    render(<DropZone />)

    const dropZoneEl = screen.getByText('Arrastra archivos aquí').closest('div')!

    const imageFile = createMockFile('foto.jpg', 'image/jpeg')

    // Crear DataTransfer simulado
    const dataTransfer = {
      files: [imageFile] as unknown as FileList,
    }

    // Act — simular el evento drop
    fireEvent.drop(dropZoneEl, { dataTransfer })

    // Assert
    expect(handleFiles).toHaveBeenCalledWith(dataTransfer.files)
  })

  it('should_prevent_default_on_dragover_to_allow_drop', () => {
    // Arrange
    mockContext({ activeBatch: EMPTY_BATCH })
    render(<DropZone />)

    const dropZoneEl = screen.getByText('Arrastra archivos aquí').closest('div')!

    // Act
    const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true })
    const preventDefaultSpy = vi.spyOn(dragOverEvent, 'preventDefault')
    dropZoneEl.dispatchEvent(dragOverEvent)

    // Assert — preventDefault debe haber sido llamado para permitir el drop
    expect(preventDefaultSpy).toHaveBeenCalled()
  })
})
