/**
 * Tests TDD para OrderStepper
 *
 * El OrderStepper es un componente visual puro (sin dependencias externas)
 * que recibe activeStep y onStepChange como props.
 * Se testea directamente sin mocks de contexto.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderStepper from '../components/OrderStepper'

// ---------------------------------------------------------------------------
// Tests: Renderizado de los 4 pasos
// ---------------------------------------------------------------------------

describe('OrderStepper — renderizado', () => {
  it('should_render_all_four_step_numbers', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    // Assert — los 4 numeros de paso deben estar presentes en el DOM
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
  })

  it('should_render_previous_button', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={2} onStepChange={vi.fn()} />)

    // Assert — debe haber un boton para retroceder
    // El componente usa ArrowLeft dentro de un Button (ghost/icon)
    // Los botones de navegacion son los primero y ultimo en el DOM
    const buttons = screen.getAllByRole('button')
    // El primer boton es el de "anterior" (ArrowLeft)
    expect(buttons[0]).toBeInTheDocument()
  })

  it('should_render_next_button', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={2} onStepChange={vi.fn()} />)

    // Assert — debe haber un boton para avanzar
    const buttons = screen.getAllByRole('button')
    // El ultimo boton es el de "siguiente" (ArrowRight)
    expect(buttons[buttons.length - 1]).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: Estado visual del paso activo
// ---------------------------------------------------------------------------

describe('OrderStepper — paso activo', () => {
  it('should_mark_step_1_as_active_when_activeStep_is_1', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    // Assert — el boton del paso 1 debe tener la clase de activo (bg-primary)
    // Los 4 botones de pasos son los buttons[1..4] (buttons[0] es "anterior")
    const allButtons = screen.getAllByRole('button')
    const stepButtons = allButtons.slice(1, 5) // indices 1-4 son los pasos
    expect(stepButtons[0]).toHaveClass('bg-primary')
  })

  it('should_mark_step_2_as_active_when_activeStep_is_2', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={2} onStepChange={vi.fn()} />)

    // Assert
    const allButtons = screen.getAllByRole('button')
    const stepButtons = allButtons.slice(1, 5)
    expect(stepButtons[1]).toHaveClass('bg-primary')
    // El paso 1 NO debe tener bg-primary
    expect(stepButtons[0]).not.toHaveClass('bg-primary')
  })

  it('should_mark_step_4_as_active_when_activeStep_is_4', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={4} onStepChange={vi.fn()} />)

    // Assert
    const allButtons = screen.getAllByRole('button')
    const stepButtons = allButtons.slice(1, 5)
    expect(stepButtons[3]).toHaveClass('bg-primary')
  })
})

// ---------------------------------------------------------------------------
// Tests: Deshabilitar botones de navegacion en los extremos
// ---------------------------------------------------------------------------

describe('OrderStepper — botones de navegacion en extremos', () => {
  it('should_disable_previous_button_when_activeStep_is_1', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    // Assert — el boton anterior (primero) debe estar deshabilitado en paso 1
    const allButtons = screen.getAllByRole('button')
    expect(allButtons[0]).toBeDisabled()
  })

  it('should_enable_previous_button_when_activeStep_is_greater_than_1', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={2} onStepChange={vi.fn()} />)

    // Assert — el boton anterior debe estar habilitado cuando no es el primer paso
    const allButtons = screen.getAllByRole('button')
    expect(allButtons[0]).not.toBeDisabled()
  })

  it('should_disable_next_button_when_activeStep_is_4', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={4} onStepChange={vi.fn()} />)

    // Assert — el boton siguiente (ultimo) debe estar deshabilitado en paso 4
    const allButtons = screen.getAllByRole('button')
    expect(allButtons[allButtons.length - 1]).toBeDisabled()
  })

  it('should_enable_next_button_when_activeStep_is_less_than_4', () => {
    // Arrange & Act
    render(<OrderStepper activeStep={3} onStepChange={vi.fn()} />)

    // Assert
    const allButtons = screen.getAllByRole('button')
    expect(allButtons[allButtons.length - 1]).not.toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests: Interaccion — clicks llaman onStepChange
// ---------------------------------------------------------------------------

describe('OrderStepper — interaccion con clicks', () => {
  it('should_call_onStepChange_with_correct_step_when_step_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={1} onStepChange={onStepChange} />)

    // Act — hacer click en el boton del paso 3
    await user.click(screen.getByText('3'))

    // Assert
    expect(onStepChange).toHaveBeenCalledWith(3)
  })

  it('should_call_onStepChange_with_step_minus_1_when_previous_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={3} onStepChange={onStepChange} />)

    // Act — hacer click en el boton "anterior"
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[0]) // primer boton = anterior

    // Assert — debe llamar con step 3 - 1 = 2
    expect(onStepChange).toHaveBeenCalledWith(2)
  })

  it('should_call_onStepChange_with_step_plus_1_when_next_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={2} onStepChange={onStepChange} />)

    // Act — hacer click en el boton "siguiente"
    const allButtons = screen.getAllByRole('button')
    await user.click(allButtons[allButtons.length - 1]) // ultimo boton = siguiente

    // Assert — debe llamar con step 2 + 1 = 3
    expect(onStepChange).toHaveBeenCalledWith(3)
  })

  it('should_call_onStepChange_with_step_number_when_step_1_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={3} onStepChange={onStepChange} />)

    // Act
    await user.click(screen.getByText('1'))

    // Assert
    expect(onStepChange).toHaveBeenCalledWith(1)
  })
})
