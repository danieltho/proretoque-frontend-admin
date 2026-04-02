/**
 * Tests TDD para CouponSection
 *
 * CouponSection recibe:
 * - couponCode: string
 * - onCouponChange: (code: string) => void
 * - onApply: () => void
 *
 * Comportamientos cubiertos:
 * - Muestra input con placeholder "¿TIENES CÓDIGO?"
 * - Muestra boton "APLICAR"
 * - Muestra boton "Mis Cupones"
 * - Al escribir en el input llama onCouponChange con el valor escrito
 * - Al hacer click en "APLICAR" llama onApply
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import CouponSection from '../components/step-confirmar/CouponSection'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOnCouponChange = vi.fn()
const mockOnApply = vi.fn()

function renderCouponSection(couponCode = '') {
  return render(
    <CouponSection
      couponCode={couponCode}
      onCouponChange={mockOnCouponChange}
      onApply={mockOnApply}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: renderizado
// ---------------------------------------------------------------------------

describe('CouponSection — renderizado', () => {
  it('should_render_input_with_placeholder', () => {
    // Arrange / Act
    renderCouponSection()

    // Assert
    expect(screen.getByPlaceholderText('¿TIENES CÓDIGO?')).toBeInTheDocument()
  })

  it('should_render_apply_button', () => {
    // Arrange / Act
    renderCouponSection()

    // Assert
    expect(screen.getByRole('button', { name: 'APLICAR' })).toBeInTheDocument()
  })

  it('should_render_mis_cupones_button', () => {
    // Arrange / Act
    renderCouponSection()

    // Assert
    expect(screen.getByRole('button', { name: 'Mis Cupones' })).toBeInTheDocument()
  })

  it('should_show_current_coupon_code_in_input', () => {
    // Arrange / Act
    renderCouponSection('DESCUENTO10')

    // Assert
    const input = screen.getByPlaceholderText('¿TIENES CÓDIGO?') as HTMLInputElement
    expect(input.value).toBe('DESCUENTO10')
  })
})

// ---------------------------------------------------------------------------
// Tests: interacciones
// ---------------------------------------------------------------------------

describe('CouponSection — interacciones', () => {
  it('should_call_onCouponChange_when_typing_in_input', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCouponSection()

    // Act
    await user.type(screen.getByPlaceholderText('¿TIENES CÓDIGO?'), 'ABC')

    // Assert — se llama por cada caracter escrito
    expect(mockOnCouponChange).toHaveBeenCalled()
    expect(mockOnCouponChange).toHaveBeenLastCalledWith(expect.stringContaining('C'))
  })

  it('should_call_onCouponChange_with_full_typed_value', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCouponSection()

    // Act
    await user.type(screen.getByPlaceholderText('¿TIENES CÓDIGO?'), 'PROMO')

    // Assert — la ultima llamada contiene el texto acumulado
    expect(mockOnCouponChange).toHaveBeenLastCalledWith('PROMO')
  })

  it('should_call_onApply_when_apply_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCouponSection('DESCUENTO10')

    // Act
    await user.click(screen.getByRole('button', { name: 'APLICAR' }))

    // Assert
    expect(mockOnApply).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_onCouponChange_when_apply_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderCouponSection('PROMO')

    // Act
    await user.click(screen.getByRole('button', { name: 'APLICAR' }))

    // Assert — el boton de aplicar no debe modificar el input
    expect(mockOnCouponChange).not.toHaveBeenCalled()
  })
})
