/**
 * Tests TDD para EditStepGuardar
 *
 * EditStepGuardar consume useOrderEdit() para acceder a:
 * - canSubmit: habilita/deshabilita el botón de guardar
 * - submitting: muestra estado de carga cuando es true
 * - handleSubmit: callback que se ejecuta al hacer click en el botón
 * - batches: para mostrar conteo de lotes y archivos nuevos
 *
 * Comportamientos cubiertos:
 * - Renderiza el título "Guardar cambios"
 * - Muestra el botón "Guardar pedido"
 * - Botón deshabilitado cuando canSubmit es false
 * - Botón habilitado cuando canSubmit es true
 * - Botón deshabilitado cuando submitting es true
 * - Muestra "Guardando..." cuando submitting es true
 * - Muestra "Guardar pedido" cuando submitting es false
 * - Clic en botón llama handleSubmit cuando está habilitado
 * - No llama handleSubmit cuando el botón está deshabilitado
 * - Muestra conteo de lotes (singular y plural)
 * - Muestra conteo de archivos nuevos (singular y plural)
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import EditStepGuardar from '../components/EditStepGuardar'
import type { EditableBatch } from '../../types/order'

// ---------------------------------------------------------------------------
// Mock del contexto
// ---------------------------------------------------------------------------

vi.mock('../context/OrderEditContext', () => ({
  useOrderEdit: vi.fn(),
}))

import { useOrderEdit } from '../context/OrderEditContext'

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

function makeFile(name: string): File {
  return new File([new Blob(['x'])], name, { type: 'image/jpeg' })
}

const mockHandleSubmit = vi.fn()

function mockContext(overrides: {
  canSubmit?: boolean
  submitting?: boolean
  batches?: EditableBatch[]
  handleSubmit?: () => Promise<void>
}) {
  vi.mocked(useOrderEdit).mockReturnValue({
    canSubmit: overrides.canSubmit ?? false,
    submitting: overrides.submitting ?? false,
    batches: overrides.batches ?? [buildEditableBatch()],
    handleSubmit: overrides.handleSubmit ?? mockHandleSubmit,
  } as ReturnType<typeof useOrderEdit>)
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: Renderizado básico
// ---------------------------------------------------------------------------

describe('EditStepGuardar — renderizado', () => {
  it('should_render_guardar_cambios_title', () => {
    // Arrange
    mockContext({})

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText('Guardar cambios')).toBeInTheDocument()
  })

  it('should_render_guardar_pedido_button', () => {
    // Arrange
    mockContext({})

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByRole('button', { name: /Guardar pedido/i })).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Estado habilitado / deshabilitado del botón
// ---------------------------------------------------------------------------

describe('EditStepGuardar — estado del botón', () => {
  it('should_disable_button_when_canSubmit_is_false', () => {
    // Arrange
    mockContext({ canSubmit: false })

    // Act
    render(<EditStepGuardar />)

    // Assert
    const button = screen.getByRole('button', { name: /Guardar pedido/i })
    expect(button).toBeDisabled()
  })

  it('should_enable_button_when_canSubmit_is_true', () => {
    // Arrange
    mockContext({ canSubmit: true })

    // Act
    render(<EditStepGuardar />)

    // Assert
    const button = screen.getByRole('button', { name: /Guardar pedido/i })
    expect(button).not.toBeDisabled()
  })

  it('should_disable_button_when_submitting_is_true', () => {
    // Arrange — mientras se envía, canSubmit también es false
    mockContext({ submitting: true, canSubmit: false })

    // Act
    render(<EditStepGuardar />)

    // Assert
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Estado de carga (submitting)
// ---------------------------------------------------------------------------

describe('EditStepGuardar — estado de carga', () => {
  it('should_show_guardando_text_when_submitting_is_true', () => {
    // Arrange
    mockContext({ submitting: true, canSubmit: false })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText('Guardando...')).toBeInTheDocument()
  })

  it('should_show_guardar_pedido_text_when_not_submitting', () => {
    // Arrange
    mockContext({ submitting: false, canSubmit: false })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByRole('button', { name: 'Guardar pedido' })).toBeInTheDocument()
  })

  it('should_not_show_guardando_text_when_submitting_is_false', () => {
    // Arrange
    mockContext({ submitting: false })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.queryByText('Guardando...')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Interacción — click en botón
// ---------------------------------------------------------------------------

describe('EditStepGuardar — interacción', () => {
  it('should_call_handleSubmit_when_button_clicked_and_enabled', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleSubmit = vi.fn().mockResolvedValue(undefined)
    mockContext({ canSubmit: true, handleSubmit })
    render(<EditStepGuardar />)

    // Act
    await user.click(screen.getByRole('button', { name: /Guardar pedido/i }))

    // Assert
    expect(handleSubmit).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_handleSubmit_when_button_is_disabled', async () => {
    // Arrange
    const user = userEvent.setup()
    const handleSubmit = vi.fn()
    mockContext({ canSubmit: false, handleSubmit })
    render(<EditStepGuardar />)

    // Act — intentar hacer click en el botón deshabilitado
    await user.click(screen.getByRole('button'))

    // Assert — el botón deshabilitado no dispara el click handler
    expect(handleSubmit).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Conteo de lotes y archivos nuevos
// ---------------------------------------------------------------------------

describe('EditStepGuardar — conteo de lotes y archivos nuevos', () => {
  it('should_show_singular_lote_when_one_batch', () => {
    // Arrange
    const batches = [buildEditableBatch()]
    mockContext({ batches })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText(/1 lote/)).toBeInTheDocument()
  })

  it('should_show_plural_lotes_when_multiple_batches', () => {
    // Arrange
    const batches = [
      buildEditableBatch({ id: 1 }),
      buildEditableBatch({ id: 2 }),
      buildEditableBatch({ id: 3 }),
    ]
    mockContext({ batches })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText(/3 lotes/)).toBeInTheDocument()
  })

  it('should_show_new_files_count_when_batches_have_new_files', () => {
    // Arrange
    const batches = [
      buildEditableBatch({
        id: 1,
        newFiles: [makeFile('a.jpg'), makeFile('b.jpg')],
      }),
      buildEditableBatch({
        id: 2,
        newFiles: [makeFile('c.jpg')],
      }),
    ]
    mockContext({ batches })

    // Act
    render(<EditStepGuardar />)

    // Assert — total de 3 archivos nuevos
    expect(screen.getByText(/3 imágenes nuevas/)).toBeInTheDocument()
  })

  it('should_show_zero_new_files_when_batches_have_no_new_files', () => {
    // Arrange
    const batches = [buildEditableBatch({ newFiles: [] })]
    mockContext({ batches })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText(/0 imágenes nuevas/)).toBeInTheDocument()
  })

  it('should_show_singular_imagen_nueva_when_one_new_file_total', () => {
    // Arrange
    const batches = [buildEditableBatch({ newFiles: [makeFile('foto.jpg')] })]
    mockContext({ batches })

    // Act
    render(<EditStepGuardar />)

    // Assert
    expect(screen.getByText(/1 imagen nueva/)).toBeInTheDocument()
  })
})
