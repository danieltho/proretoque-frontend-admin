/**
 * Tests para FilesCard — componente genérico reutilizable de zona de arrastre + tabla de archivos.
 *
 * Comportamientos cubiertos:
 *   Rendering:
 *   1. Renderiza el título proporcionado via prop
 *   2. Cuando onFilesAdded está definido, renderiza drop zone con texto "Arrastra archivos aquí"
 *   3. Cuando onFilesAdded está definido, renderiza subtítulo "o haz clic para añadir"
 *   4. Cuando onFilesAdded NO está definido, NO renderiza la drop zone (modo solo lectura)
 *   5. Cuando files está vacío, NO renderiza la tabla
 *   6. Cuando files tiene elementos, renderiza cabeceras: "Archivo Nombre", "Tipo", "Tamaño"
 *
 *   Filas de la tabla:
 *   7. Muestra el nombre de cada archivo
 *   8. Muestra la extensión del tipo (e.g. "JPG")
 *   9. Muestra el tamaño formateado (e.g. "350 KB")
 *   10. Muestra un thumbnail (img) para archivos de imagen
 *   11. Muestra botón "Eliminar archivo" por fila cuando onRemove está definido
 *   12. NO muestra botón eliminar cuando onRemove NO está definido
 *   13. Muestra botón "Ver archivo" por fila cuando onPreview está definido
 *   14. NO muestra botón ver cuando onPreview NO está definido
 *
 *   Interacciones:
 *   15. Hacer clic en la drop zone dispara un file input oculto
 *   16. Soltar archivos sobre la drop zone llama onFilesAdded con el FileList
 *   17. Hacer clic en eliminar llama onRemove con el índice correcto
 *   18. Hacer clic en vista previa llama onPreview con el índice correcto
 *   19. Seleccionar archivos via input oculto llama onFilesAdded
 */

import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FilesCard from '@/shared/ui/FilesCard'

// ---------------------------------------------------------------------------
// Mocks globales
// ---------------------------------------------------------------------------

vi.stubGlobal('URL', {
  createObjectURL: vi.fn(() => 'blob:fake-url'),
  revokeObjectURL: vi.fn(),
})

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockFile(name: string, size: number, type: string): File {
  const file = new File(['x'.repeat(size)], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

const jpgFile = createMockFile('foto.jpg', 358400, 'image/jpeg') // ~350 KB
const pngFile = createMockFile('imagen.png', 1024, 'image/png')

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// 1–4: Rendering — título y drop zone
// ---------------------------------------------------------------------------

describe('FilesCard — rendering título y drop zone', () => {
  it('should_render_provided_title', () => {
    render(<FilesCard title="Archivos a retocar" files={[]} />)

    expect(screen.getByText('Archivos a retocar')).toBeInTheDocument()
  })

  it('should_render_dropzone_main_text_when_onFilesAdded_is_provided', () => {
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={vi.fn()} />)

    expect(screen.getByText('Arrastra archivos aquí')).toBeInTheDocument()
  })

  it('should_render_dropzone_subtitle_when_onFilesAdded_is_provided', () => {
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={vi.fn()} />)

    expect(screen.getByText('o haz clic para añadir')).toBeInTheDocument()
  })

  it('should_not_render_dropzone_when_onFilesAdded_is_not_provided', () => {
    render(<FilesCard title="Archivos" files={[]} />)

    expect(screen.queryByText('Arrastra archivos aquí')).not.toBeInTheDocument()
    expect(screen.queryByText('o haz clic para añadir')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 5–6: Rendering — tabla de archivos
// ---------------------------------------------------------------------------

describe('FilesCard — tabla de archivos', () => {
  it('should_not_render_table_when_files_is_empty', () => {
    render(<FilesCard title="Archivos" files={[]} />)

    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('should_render_table_headers_when_files_has_items', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    expect(screen.getByText('Nombre')).toBeInTheDocument()
    expect(screen.getByText('Tipo')).toBeInTheDocument()
    expect(screen.getByText('Tamaño')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 7–10: Filas de tabla — datos de archivo
// ---------------------------------------------------------------------------

describe('FilesCard — contenido de filas', () => {
  it('should_show_file_name_for_each_file', () => {
    render(<FilesCard title="Archivos" files={[jpgFile, pngFile]} />)

    expect(screen.getByText('foto.jpg')).toBeInTheDocument()
    expect(screen.getByText('imagen.png')).toBeInTheDocument()
  })

  it('should_show_file_type_extension_in_uppercase', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    expect(screen.getByText('JPG')).toBeInTheDocument()
  })

  it('should_show_formatted_file_size_in_KB', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    // 358400 bytes = 350.0 KB
    expect(screen.getByText(/350\.0\s*KB/)).toBeInTheDocument()
  })

  it('should_show_thumbnail_img_for_image_file', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    const img = screen.getByAltText('foto.jpg')
    expect(img).toBeInTheDocument()
    expect(img.tagName).toBe('IMG')
  })
})

// ---------------------------------------------------------------------------
// 11–14: Botones eliminar y ver archivo
// ---------------------------------------------------------------------------

describe('FilesCard — botón eliminar', () => {
  it('should_show_remove_button_per_row_when_onRemove_is_provided', () => {
    render(<FilesCard title="Archivos" files={[jpgFile, pngFile]} onRemove={vi.fn()} />)

    const buttons = screen.getAllByRole('button', { name: 'Eliminar archivo' })
    expect(buttons).toHaveLength(2)
  })

  it('should_not_show_remove_button_when_onRemove_is_not_provided', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    expect(screen.queryByRole('button', { name: 'Eliminar archivo' })).not.toBeInTheDocument()
  })
})

describe('FilesCard — botón ver archivo', () => {
  it('should_show_preview_button_per_row_when_onPreview_is_provided', () => {
    render(<FilesCard title="Archivos" files={[jpgFile, pngFile]} onPreview={vi.fn()} />)

    const buttons = screen.getAllByRole('button', { name: 'Ver archivo' })
    expect(buttons).toHaveLength(2)
  })

  it('should_not_show_preview_button_when_onPreview_is_not_provided', () => {
    render(<FilesCard title="Archivos" files={[jpgFile]} />)

    expect(screen.queryByRole('button', { name: 'Ver archivo' })).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// 15–19: Interacciones
// ---------------------------------------------------------------------------

describe('FilesCard — interacción drop zone click', () => {
  it('should_have_hidden_file_input_when_onFilesAdded_is_provided', () => {
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={vi.fn()} />)

    const input = document.querySelector('input[type="file"]')
    expect(input).toBeInTheDocument()
  })

  it('should_trigger_file_input_click_when_dropzone_is_clicked', async () => {
    const user = userEvent.setup()
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={vi.fn()} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(input, 'click')

    const dropZone = screen.getByText('Arrastra archivos aquí').closest('[role="button"]')!
    await user.click(dropZone)

    expect(clickSpy).toHaveBeenCalledTimes(1)
  })
})

describe('FilesCard — interacción drag & drop', () => {
  it('should_call_onFilesAdded_with_dropped_files', () => {
    const onFilesAdded = vi.fn()
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={onFilesAdded} />)

    const dropZone = screen.getByText('Arrastra archivos aquí').closest('[role="button"]')!

    const dataTransfer = {
      files: [jpgFile] as unknown as FileList,
      items: [],
      types: ['Files'],
    }

    fireEvent.dragOver(dropZone, { dataTransfer })
    fireEvent.drop(dropZone, { dataTransfer })

    expect(onFilesAdded).toHaveBeenCalledTimes(1)
    expect(onFilesAdded).toHaveBeenCalledWith(dataTransfer.files)
  })
})

describe('FilesCard — interacción botón eliminar', () => {
  it('should_call_onRemove_with_correct_index_when_remove_is_clicked', async () => {
    const user = userEvent.setup()
    const onRemove = vi.fn()
    render(<FilesCard title="Archivos" files={[jpgFile, pngFile]} onRemove={onRemove} />)

    const buttons = screen.getAllByRole('button', { name: 'Eliminar archivo' })
    await user.click(buttons[1])

    expect(onRemove).toHaveBeenCalledWith(1)
    expect(onRemove).toHaveBeenCalledTimes(1)
  })
})

describe('FilesCard — interacción botón ver archivo', () => {
  it('should_call_onPreview_with_correct_index_when_preview_is_clicked', async () => {
    const user = userEvent.setup()
    const onPreview = vi.fn()
    render(<FilesCard title="Archivos" files={[jpgFile, pngFile]} onPreview={onPreview} />)

    const buttons = screen.getAllByRole('button', { name: 'Ver archivo' })
    await user.click(buttons[0])

    expect(onPreview).toHaveBeenCalledWith(0)
    expect(onPreview).toHaveBeenCalledTimes(1)
  })
})

describe('FilesCard — interacción input file oculto', () => {
  it('should_call_onFilesAdded_when_files_are_selected_via_input', async () => {
    const onFilesAdded = vi.fn()
    render(<FilesCard title="Archivos" files={[]} onFilesAdded={onFilesAdded} />)

    const input = document.querySelector('input[type="file"]') as HTMLInputElement

    Object.defineProperty(input, 'files', {
      value: [jpgFile] as unknown as FileList,
      configurable: true,
    })

    fireEvent.change(input)

    expect(onFilesAdded).toHaveBeenCalledTimes(1)
    expect(onFilesAdded).toHaveBeenCalledWith(input.files)
  })
})
