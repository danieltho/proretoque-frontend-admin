/**
 * Tests para FileListView con interfaz MediaItem
 *
 * Comportamientos cubiertos:
 *   - Muestra columna "Tipo" con la extensión del archivo
 *   - Muestra thumbnail para imágenes
 *   - Muestra icono de Phosphor para archivos no-imagen
 *   - Muestra botón editar (NotePencil) cuando onEdit está definido y es imagen
 *   - No muestra botón editar para archivos no-imagen
 *   - Llama onEdit con índice al hacer click en editar
 *   - Sigue mostrando botón eliminar
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FileListView from '../FileListView'
import type { MediaItem } from '@/shared/types/media'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItem(fileName: string, mimeType = 'image/jpeg', size = 1024): MediaItem {
  return {
    src: 'blob:preview',
    name: fileName,
    fileName,
    mimeType,
    size,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: columna tipo
// ---------------------------------------------------------------------------

describe('FileListView — columna tipo', () => {
  it('should_show_type_column_header', () => {
    render(<FileListView items={[makeItem('foto.jpg')]} onRemove={vi.fn()} />)

    expect(screen.getByText('Tipo')).toBeInTheDocument()
  })

  it('should_show_JPEG_label_for_jpg_file', () => {
    render(<FileListView items={[makeItem('foto.jpg', 'image/jpeg')]} onRemove={vi.fn()} />)

    expect(screen.getByText('JPEG')).toBeInTheDocument()
  })

  it('should_show_PNG_label_for_png_file', () => {
    render(<FileListView items={[makeItem('foto.png', 'image/png')]} onRemove={vi.fn()} />)

    expect(screen.getByText('PNG')).toBeInTheDocument()
  })

  it('should_show_PDF_label_for_pdf_file', () => {
    render(<FileListView items={[makeItem('doc.pdf', 'application/pdf')]} onRemove={vi.fn()} />)

    expect(screen.getByText('PDF')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: preview — thumbnail vs icono
// ---------------------------------------------------------------------------

describe('FileListView — preview thumbnail vs icono', () => {
  it('should_show_img_tag_for_image_file', () => {
    render(<FileListView items={[makeItem('foto.jpg', 'image/jpeg')]} onRemove={vi.fn()} />)

    const img = screen.getByAltText('foto.jpg')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })

  it('should_not_show_img_tag_for_non_image_file', () => {
    render(<FileListView items={[makeItem('doc.pdf', 'application/pdf')]} onRemove={vi.fn()} />)

    expect(screen.queryByAltText('doc.pdf')).not.toBeInTheDocument()
  })

  it('should_show_file_icon_for_non_image_file', () => {
    render(<FileListView items={[makeItem('doc.pdf', 'application/pdf')]} onRemove={vi.fn()} />)

    const icon = document.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: botón editar
// ---------------------------------------------------------------------------

describe('FileListView — botón editar', () => {
  it('should_show_edit_button_when_onEdit_is_provided_and_file_is_image', () => {
    render(
      <FileListView
        items={[makeItem('foto.jpg', 'image/jpeg')]}
        onRemove={vi.fn()}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.getByRole('button', { name: /editar/i })).toBeInTheDocument()
  })

  it('should_not_show_edit_button_when_onEdit_is_not_provided', () => {
    render(<FileListView items={[makeItem('foto.jpg', 'image/jpeg')]} onRemove={vi.fn()} />)

    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
  })

  it('should_not_show_edit_button_for_non_image_file', () => {
    render(
      <FileListView
        items={[makeItem('doc.pdf', 'application/pdf')]}
        onRemove={vi.fn()}
        onEdit={vi.fn()}
      />,
    )

    expect(screen.queryByRole('button', { name: /editar/i })).not.toBeInTheDocument()
  })

  it('should_call_onEdit_with_index_when_edit_button_is_clicked', async () => {
    const user = userEvent.setup()
    const onEdit = vi.fn()

    render(
      <FileListView
        items={[makeItem('foto.jpg', 'image/jpeg')]}
        onRemove={vi.fn()}
        onEdit={onEdit}
      />,
    )

    await user.click(screen.getByRole('button', { name: /editar/i }))

    expect(onEdit).toHaveBeenCalledWith(0)
    expect(onEdit).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: botón eliminar
// ---------------------------------------------------------------------------

describe('FileListView — botón eliminar', () => {
  it('should_still_show_remove_button', () => {
    render(<FileListView items={[makeItem('foto.jpg', 'image/jpeg')]} onRemove={vi.fn()} />)

    expect(screen.getByRole('button', { name: /eliminar/i })).toBeInTheDocument()
  })

  it('should_call_onRemove_with_index_when_remove_button_is_clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()

    render(<FileListView items={[makeItem('foto.jpg', 'image/jpeg')]} onRemove={onRemove} />)

    await user.click(screen.getByRole('button', { name: /eliminar/i }))

    expect(onRemove).toHaveBeenCalledWith(0)
  })
})
