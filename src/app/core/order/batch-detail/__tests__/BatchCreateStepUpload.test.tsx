/**
 * Tests TDD — BatchCreateStepUpload (fase RED)
 *
 * BatchCreateStepUpload es el componente presentacional del paso 1.
 * Props:
 *   files: File[]
 *   previews: string[]
 *   canGoNext: boolean
 *   onNext: () => void
 *   onBack: () => void
 *   onFilesChange: (files: FileList | null) => void
 *   onRemoveFile: (index: number) => void
 *
 * Comportamientos cubiertos:
 *   - Renderiza la zona de drag & drop
 *   - Botón "Siguiente" disabled cuando canGoNext=false
 *   - Botón "Siguiente" enabled cuando canGoNext=true
 *   - Botón "Siguiente" llama onNext al hacer click
 *   - Botón "Cancelar/Volver" llama onBack
 *   - Muestra previews de archivos cargados
 *   - Muestra el conteo de archivos cuando hay archivos
 *   - No muestra previews cuando files está vacío
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import BatchCreateStepUpload from '../components/BatchCreateStepUpload'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeFile(name: string, type = 'image/jpeg', size = 1024): File {
  const file = new File([new Blob(['x'])], name, { type })
  Object.defineProperty(file, 'size', { value: size, configurable: true })
  return file
}

interface RenderProps {
  files?: File[]
  previews?: string[]
  canGoNext?: boolean
  onNext?: () => void
  onBack?: () => void
  onFilesChange?: (files: FileList | null) => void
  onRemoveFile?: (index: number) => void
}

function renderComponent(props: RenderProps = {}) {
  const defaults = {
    files: [],
    previews: [],
    canGoNext: false,
    onNext: vi.fn(),
    onBack: vi.fn(),
    onFilesChange: vi.fn(),
    onRemoveFile: vi.fn(),
  }
  return render(<BatchCreateStepUpload {...defaults} {...props} />)
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Zona de drag & drop
// ---------------------------------------------------------------------------

describe('BatchCreateStepUpload — zona de drag & drop', () => {
  it('should_render_drop_zone_area', () => {
    // Arrange & Act
    renderComponent()

    // Assert — debe haber una zona de arrastrar y soltar visible
    // Puede ser un role=button, un elemento con texto de instrucción, o data-testid
    const dropZone =
      screen.queryByRole('button', { name: /arrastra|selecciona|subir/i }) ??
      screen.queryByText(/arrastra|selecciona imágenes/i)
    expect(dropZone).not.toBeNull()
  })

  it('should_render_upload_instruction_text', () => {
    // Arrange & Act
    renderComponent()

    // Assert — texto de instrucción de upload visible
    expect(screen.getByText(/arrastra|selecciona|imágenes/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Botón "Siguiente"
// ---------------------------------------------------------------------------

describe('BatchCreateStepUpload — botón Siguiente', () => {
  it('should_render_next_button', () => {
    // Arrange & Act
    renderComponent()

    // Assert
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeInTheDocument()
  })

  it('should_disable_next_button_when_canGoNext_is_false', () => {
    // Arrange & Act
    renderComponent({ canGoNext: false })

    // Assert
    expect(screen.getByRole('button', { name: /siguiente/i })).toBeDisabled()
  })

  it('should_enable_next_button_when_canGoNext_is_true', () => {
    // Arrange & Act
    renderComponent({ canGoNext: true })

    // Assert
    expect(screen.getByRole('button', { name: /siguiente/i })).not.toBeDisabled()
  })

  it('should_call_onNext_when_next_button_clicked_and_canGoNext_is_true', async () => {
    // Arrange
    const user = userEvent.setup()
    const onNext = vi.fn()
    renderComponent({ canGoNext: true, onNext })

    // Act
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    // Assert
    expect(onNext).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_onNext_when_next_button_is_disabled', async () => {
    // Arrange
    const user = userEvent.setup()
    const onNext = vi.fn()
    renderComponent({ canGoNext: false, onNext })

    // Act — intentar click en botón deshabilitado
    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    // Assert — no se llama onNext si está disabled
    expect(onNext).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Botón "Cancelar / Volver"
// ---------------------------------------------------------------------------

describe('BatchCreateStepUpload — botón Cancelar', () => {
  it('should_render_cancel_or_back_button', () => {
    // Arrange & Act
    renderComponent()

    // Assert — botón de cancelar/volver presente
    expect(screen.getByRole('button', { name: /cancelar|volver/i })).toBeInTheDocument()
  })

  it('should_call_onBack_when_cancel_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onBack = vi.fn()
    renderComponent({ onBack })

    // Act
    await user.click(screen.getByRole('button', { name: /cancelar|volver/i }))

    // Assert
    expect(onBack).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: Preview de archivos cargados
// ---------------------------------------------------------------------------

describe('BatchCreateStepUpload — previews de archivos', () => {
  it('should_not_show_file_previews_when_files_is_empty', () => {
    // Arrange & Act
    renderComponent({ files: [], previews: [] })

    // Assert — sin archivos no hay previews
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should_show_preview_images_when_files_are_present', () => {
    // Arrange
    const files = [makeFile('foto.jpg'), makeFile('otra.jpg')]
    const previews = ['blob:preview-1', 'blob:preview-2']

    // Act
    renderComponent({ files, previews })

    // Assert — se muestran imágenes de preview
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(2)
  })

  it('should_display_file_count_when_files_are_present', () => {
    // Arrange
    const files = [makeFile('a.jpg'), makeFile('b.jpg'), makeFile('c.jpg')]
    const previews = ['blob:1', 'blob:2', 'blob:3']

    // Act
    renderComponent({ files, previews })

    // Assert — muestra el conteo de imágenes
    expect(screen.getByText(/3/)).toBeInTheDocument()
  })

  it('should_show_remove_button_for_each_file', () => {
    // Arrange
    const files = [makeFile('a.jpg'), makeFile('b.jpg')]
    const previews = ['blob:1', 'blob:2']

    // Act
    renderComponent({ files, previews })

    // Assert — un botón de eliminar por archivo
    // Buscar botones con aria-label o con texto X, eliminar, etc.
    const removeButtons = screen.getAllByRole('button', { name: /eliminar|quitar|×|✕/i })
    expect(removeButtons.length).toBeGreaterThanOrEqual(files.length)
  })
})
