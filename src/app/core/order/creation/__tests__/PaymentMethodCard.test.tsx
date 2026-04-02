/**
 * Tests TDD para PaymentMethodCard
 *
 * PaymentMethodCard recibe:
 * - method: PaymentMethodOption  { id, label, buttonLabel }
 * - disabled: boolean
 * - submitting: boolean
 * - onPay: () => void
 *
 * Comportamientos cubiertos:
 * - Muestra el label del metodo de pago (ej. "TARJETA DE CREDITO")
 * - Muestra el boton con el buttonLabel del metodo (ej. "PAGAR" o "Pay with PayPal")
 * - El boton esta deshabilitado cuando disabled=true
 * - El boton esta habilitado cuando disabled=false y submitting=false
 * - Al hacer click en el boton habilitado llama onPay
 * - El boton esta deshabilitado cuando submitting=true
 * - No llama onPay cuando el boton esta deshabilitado
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PaymentMethodCard from '../components/step-confirmar/PaymentMethodCard'
import type { PaymentMethodOption } from '../types/payment'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const creditCardMethod: PaymentMethodOption = {
  id: 'credit-card',
  label: 'TARJETA DE CREDITO',
  buttonLabel: 'PAGAR',
}

const paypalMethod: PaymentMethodOption = {
  id: 'paypal',
  label: 'PAYPAL',
  buttonLabel: 'Pay with PayPal',
}

const mockOnPay = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: renderizado
// ---------------------------------------------------------------------------

describe('PaymentMethodCard — renderizado', () => {
  it('should_render_method_label', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByText('TARJETA DE CREDITO')).toBeInTheDocument()
  })

  it('should_render_button_with_method_button_label', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'PAGAR' })).toBeInTheDocument()
  })

  it('should_render_paypal_button_with_paypal_label', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={paypalMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'Pay with PayPal' })).toBeInTheDocument()
  })

  it('should_render_paypal_label', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={paypalMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByText('PAYPAL')).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: estado del boton
// ---------------------------------------------------------------------------

describe('PaymentMethodCard — estado del boton', () => {
  it('should_disable_button_when_disabled_is_true', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={true}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'PAGAR' })).toBeDisabled()
  })

  it('should_enable_button_when_disabled_is_false_and_not_submitting', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Assert
    expect(screen.getByRole('button', { name: 'PAGAR' })).not.toBeDisabled()
  })

  it('should_disable_button_when_submitting_is_true', () => {
    // Arrange / Act
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={true}
        onPay={mockOnPay}
      />,
    )

    // Assert — durante el envio el boton no debe ser clickeable
    expect(screen.getByRole('button')).toBeDisabled()
  })
})

// ---------------------------------------------------------------------------
// Tests: interaccion
// ---------------------------------------------------------------------------

describe('PaymentMethodCard — interaccion', () => {
  it('should_call_onPay_when_button_clicked_and_enabled', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Act
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(mockOnPay).toHaveBeenCalledTimes(1)
  })

  it('should_not_call_onPay_when_button_is_disabled', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={true}
        submitting={false}
        onPay={mockOnPay}
      />,
    )

    // Act — intentar click en boton deshabilitado
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(mockOnPay).not.toHaveBeenCalled()
  })

  it('should_not_call_onPay_when_submitting', async () => {
    // Arrange
    const user = userEvent.setup()
    render(
      <PaymentMethodCard
        method={creditCardMethod}
        disabled={false}
        submitting={true}
        onPay={mockOnPay}
      />,
    )

    // Act
    await user.click(screen.getByRole('button'))

    // Assert
    expect(mockOnPay).not.toHaveBeenCalled()
  })
})
