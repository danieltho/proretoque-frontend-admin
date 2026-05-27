/**
 * Tests para OrderStepper
 *
 * Componente visual puro (sin dependencias externas) que recibe
 * activeStep y onStepChange como props. Renderiza 4 labels de paso
 * (Archivos, Retoques, Tiempo, Pago) seguidos de 4 "dots" clicables.
 * El paso activo marca su label con font-semibold; los inactivos con opacity-50.
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import OrderStepper from '../components/OrderStepper'

const STEP_LABELS = ['Archivos', 'Retoques', 'Tiempo', 'Pago']

// ---------------------------------------------------------------------------
// Renderizado
// ---------------------------------------------------------------------------

describe('OrderStepper — renderizado', () => {
  it('should_render_all_four_step_labels', () => {
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    for (const label of STEP_LABELS) {
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
    }
  })

  it('should_render_a_dot_button_per_step', () => {
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    // 4 labels + 4 dots = 8 botones
    expect(screen.getAllByRole('button')).toHaveLength(STEP_LABELS.length * 2)
  })
})

// ---------------------------------------------------------------------------
// Estado visual del paso activo
// ---------------------------------------------------------------------------

describe('OrderStepper — paso activo', () => {
  it('should_mark_step_1_label_as_active_when_activeStep_is_1', () => {
    render(<OrderStepper activeStep={1} onStepChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Archivos' })).toHaveClass('font-semibold')
  })

  it('should_mark_step_2_label_as_active_when_activeStep_is_2', () => {
    render(<OrderStepper activeStep={2} onStepChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Retoques' })).toHaveClass('font-semibold')
    // El paso 1 ya no es el activo
    const step1 = screen.getByRole('button', { name: 'Archivos' })
    expect(step1).not.toHaveClass('font-semibold')
    expect(step1).toHaveClass('opacity-50')
  })

  it('should_mark_step_4_label_as_active_when_activeStep_is_4', () => {
    render(<OrderStepper activeStep={4} onStepChange={vi.fn()} />)

    expect(screen.getByRole('button', { name: 'Pago' })).toHaveClass('font-semibold')
  })
})

// ---------------------------------------------------------------------------
// Interaccion — clicks llaman onStepChange
// ---------------------------------------------------------------------------

describe('OrderStepper — interaccion con clicks', () => {
  it('should_call_onStepChange_with_correct_step_when_label_clicked', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={1} onStepChange={onStepChange} />)

    await user.click(screen.getByRole('button', { name: 'Tiempo' }))

    expect(onStepChange).toHaveBeenCalledWith(3)
  })

  it('should_call_onStepChange_with_1_when_first_label_clicked', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={3} onStepChange={onStepChange} />)

    await user.click(screen.getByRole('button', { name: 'Archivos' }))

    expect(onStepChange).toHaveBeenCalledWith(1)
  })

  it('should_call_onStepChange_when_dot_clicked', async () => {
    const user = userEvent.setup()
    const onStepChange = vi.fn()
    render(<OrderStepper activeStep={1} onStepChange={onStepChange} />)

    // Los labels se renderizan primero y los dots despues; el segundo dot = paso 2
    const dotButtons = screen.getAllByRole('button').slice(STEP_LABELS.length)
    await user.click(dotButtons[1])

    expect(onStepChange).toHaveBeenCalledWith(2)
  })
})
