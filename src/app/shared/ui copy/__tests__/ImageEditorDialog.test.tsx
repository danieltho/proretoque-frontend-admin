/**
 * Tests para ImageEditorDialog
 *
 * Comportamientos cubiertos:
 *   - No renderiza nada cuando open es false
 *   - Renderiza el editor cuando open es true
 *   - Muestra los botones de herramientas
 *   - Llama onSave con File cuando se guarda
 *   - Llama onClose cuando se cierra
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ImageEditorDialog from '../ImageEditorDialog'

// Mock react-advanced-cropper
vi.mock('react-advanced-cropper', () => ({
  Cropper: vi.fn(({ ref }: { ref: React.Ref<unknown> }) => {
    // Expose a fake getCanvas via ref
    if (typeof ref === 'function') {
      ref({
        getCanvas: () => {
          const canvas = document.createElement('canvas')
          canvas.width = 100
          canvas.height = 100
          return canvas
        },
      })
    } else if (ref && typeof ref === 'object') {
      ;(ref as React.MutableRefObject<unknown>).current = {
        getCanvas: () => {
          const canvas = document.createElement('canvas')
          canvas.width = 100
          canvas.height = 100
          return canvas
        },
      }
    }
    return <div data-testid="cropper" />
  }),
}))

// Mock fabric.js
vi.mock('fabric', () => ({
  Canvas: vi.fn().mockImplementation(() => ({
    isDrawingMode: false,
    freeDrawingBrush: null,
    add: vi.fn(),
    insertAt: vi.fn(),
    renderAll: vi.fn(),
    setActiveObject: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
    dispose: vi.fn(),
    toDataURL: () => 'data:image/png;base64,abc123',
  })),
  PencilBrush: vi.fn(),
  Rect: vi.fn(),
  Ellipse: vi.fn(),
  Line: vi.fn(),
  IText: vi.fn().mockImplementation(() => ({ enterEditing: vi.fn() })),
  FabricImage: vi.fn(),
}))

// Mock CSS import
vi.mock('react-advanced-cropper/dist/style.css', () => ({}))

function makeFile(name: string): File {
  return new File([new Blob(['x'])], name, { type: 'image/jpeg' })
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ImageEditorDialog — visibilidad', () => {
  it('should_not_render_editor_when_open_is_false', () => {
    render(
      <ImageEditorDialog
        open={false}
        file={makeFile('foto.jpg')}
        preview="blob:1"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.queryByTestId('cropper')).not.toBeInTheDocument()
  })

  it('should_render_editor_when_open_is_true', () => {
    render(
      <ImageEditorDialog
        open={true}
        file={makeFile('foto.jpg')}
        preview="blob:1"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByTestId('cropper')).toBeInTheDocument()
  })

  it('should_render_toolbar_buttons', () => {
    render(
      <ImageEditorDialog
        open={true}
        file={makeFile('foto.jpg')}
        preview="blob:1"
        onClose={vi.fn()}
        onSave={vi.fn()}
      />,
    )

    expect(screen.getByText('Recortar')).toBeInTheDocument()
    expect(screen.getByText('Dibujar')).toBeInTheDocument()
    expect(screen.getByText('Formas')).toBeInTheDocument()
    expect(screen.getByText('Texto')).toBeInTheDocument()
    expect(screen.getByText('Guardar')).toBeInTheDocument()
    expect(screen.getByText('Cerrar')).toBeInTheDocument()
  })
})

describe('ImageEditorDialog — onClose', () => {
  it('should_call_onClose_when_close_is_clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <ImageEditorDialog
        open={true}
        file={makeFile('foto.jpg')}
        preview="blob:1"
        onClose={onClose}
        onSave={vi.fn()}
      />,
    )

    await user.click(screen.getByText('Cerrar'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })
})

describe('ImageEditorDialog — onSave', () => {
  it('should_call_onSave_with_file_when_save_is_clicked', async () => {
    const user = userEvent.setup()
    const onSave = vi.fn()

    render(
      <ImageEditorDialog
        open={true}
        file={makeFile('foto.jpg')}
        preview="blob:1"
        onClose={vi.fn()}
        onSave={onSave}
      />,
    )

    await user.click(screen.getByText('Guardar'))

    expect(onSave).toHaveBeenCalledTimes(1)
    expect(onSave).toHaveBeenCalledWith(expect.any(File))
  })
})
