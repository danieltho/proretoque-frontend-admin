/**
 * Tests TDD para BatchNameDialog
 *
 * BatchNameDialog es un componente puro (sin dependencias de contexto ni stores).
 * Recibe: open, onClose, currentName, onSave como props.
 *
 * Comportamientos cubiertos:
 * - Se renderiza cuando open=true
 * - No se renderiza cuando open=false
 * - Sincroniza currentName al input cuando el dialog se abre
 * - Llama onSave con el nombre recortado (trim) al guardar
 * - No llama onSave si el nombre esta vacio o es solo espacios
 * - Llama onClose al cancelar
 * - Llama onSave al presionar Enter en el input
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import BatchNameDialog from '../components/BatchNameDialog'

// ---------------------------------------------------------------------------
// Tests: Visibilidad del dialog
// ---------------------------------------------------------------------------

describe('BatchNameDialog — visibilidad', () => {
  it('should_render_dialog_content_when_open_is_true', () => {
    // Arrange & Act
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={vi.fn()} />)

    // Assert — el titulo del dialog debe estar en el DOM
    expect(screen.getByText('Editar nombre del lote')).toBeInTheDocument()
  })

  it('should_not_render_dialog_content_when_open_is_false', () => {
    // Arrange & Act
    render(<BatchNameDialog open={false} onClose={vi.fn()} currentName="Lote 1" onSave={vi.fn()} />)

    // Assert — el titulo del dialog NO debe estar visible
    expect(screen.queryByText('Editar nombre del lote')).not.toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Sincronizacion de currentName al abrirse
// ---------------------------------------------------------------------------

describe('BatchNameDialog — sincronizacion del nombre al abrir', () => {
  it('should_display_currentName_in_input_when_dialog_opens', () => {
    // Arrange & Act
    render(
      <BatchNameDialog
        open={true}
        onClose={vi.fn()}
        currentName="Mi lote especial"
        onSave={vi.fn()}
      />,
    )

    // Assert — el input debe mostrar el valor de currentName
    const input = screen.getByPlaceholderText('Nombre del lote')
    expect(input).toHaveValue('Mi lote especial')
  })

  it('should_reset_input_to_new_currentName_when_dialog_reopens', async () => {
    // Arrange — primero abrimos con "Lote A"
    const { rerender } = render(
      <BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote A" onSave={vi.fn()} />,
    )

    // Act — cerramos y volvemos a abrir con un nombre diferente
    rerender(
      <BatchNameDialog open={false} onClose={vi.fn()} currentName="Lote A" onSave={vi.fn()} />,
    )
    rerender(
      <BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote B" onSave={vi.fn()} />,
    )

    // Assert — el input debe mostrar el nuevo nombre
    const input = screen.getByPlaceholderText('Nombre del lote')
    expect(input).toHaveValue('Lote B')
  })
})

// ---------------------------------------------------------------------------
// Tests: Guardado con onSave
// ---------------------------------------------------------------------------

describe('BatchNameDialog — guardar nombre', () => {
  it('should_call_onSave_with_trimmed_name_when_save_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={onSave} />)

    // Act — limpiar el input y escribir un nombre con espacios al inicio/fin
    const input = screen.getByPlaceholderText('Nombre del lote')
    await user.clear(input)
    await user.type(input, '  Lote retocado  ')
    await user.click(screen.getByText('Guardar'))

    // Assert — onSave debe recibir el nombre sin espacios extra
    expect(onSave).toHaveBeenCalledWith('Lote retocado')
    expect(onSave).toHaveBeenCalledTimes(1)
  })

  it('should_call_onSave_with_current_name_when_no_changes_made', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(
      <BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote original" onSave={onSave} />,
    )

    // Act — guardar sin modificar nada
    await user.click(screen.getByText('Guardar'))

    // Assert
    expect(onSave).toHaveBeenCalledWith('Lote original')
  })

  it('should_call_onSave_when_enter_key_pressed_in_input', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={onSave} />)

    // Act — presionar Enter en el input
    const input = screen.getByPlaceholderText('Nombre del lote')
    await user.click(input)
    await user.keyboard('{Enter}')

    // Assert
    expect(onSave).toHaveBeenCalledWith('Lote 1')
  })
})

// ---------------------------------------------------------------------------
// Tests: Guardar debe estar deshabilitado con nombre vacio
// ---------------------------------------------------------------------------

describe('BatchNameDialog — validacion de nombre vacio', () => {
  it('should_disable_save_button_when_input_is_empty', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={vi.fn()} />)

    // Act — borrar el contenido del input
    const input = screen.getByPlaceholderText('Nombre del lote')
    await user.clear(input)

    // Assert — el boton Guardar debe estar deshabilitado
    expect(screen.getByText('Guardar')).toBeDisabled()
  })

  it('should_disable_save_button_when_input_contains_only_spaces', async () => {
    // Arrange
    const user = userEvent.setup()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={vi.fn()} />)

    // Act — limpiar y escribir solo espacios
    const input = screen.getByPlaceholderText('Nombre del lote')
    await user.clear(input)
    await user.type(input, '   ')

    // Assert — el boton Guardar debe seguir deshabilitado
    expect(screen.getByText('Guardar')).toBeDisabled()
  })

  it('should_not_call_onSave_when_name_is_only_spaces', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={onSave} />)

    // Act — borrar y escribir solo espacios, luego intentar guardar via Enter
    const input = screen.getByPlaceholderText('Nombre del lote')
    await user.clear(input)
    await user.type(input, '   ')
    await user.keyboard('{Enter}')

    // Assert — onSave no debe haber sido llamada
    expect(onSave).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Cancelar
// ---------------------------------------------------------------------------

describe('BatchNameDialog — cancelar', () => {
  it('should_call_onClose_when_cancel_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BatchNameDialog open={true} onClose={onClose} currentName="Lote 1" onSave={vi.fn()} />)

    // Act
    await user.click(screen.getByText('Cancelar'))

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_onSave_when_cancel_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onSave = vi.fn()
    render(<BatchNameDialog open={true} onClose={vi.fn()} currentName="Lote 1" onSave={onSave} />)

    // Act
    await user.click(screen.getByText('Cancelar'))

    // Assert
    expect(onSave).not.toHaveBeenCalled()
  })

  it('should_call_onClose_when_save_button_clicked_after_saving', async () => {
    // Arrange
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<BatchNameDialog open={true} onClose={onClose} currentName="Lote 1" onSave={vi.fn()} />)

    // Act — guardar debe llamar onClose automaticamente
    await user.click(screen.getByText('Guardar'))

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
