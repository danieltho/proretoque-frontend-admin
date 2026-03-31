/**
 * Tests TDD para PaymentMethodSelector
 *
 * PaymentMethodSelector recibe:
 * - methods: PaymentMethodOption[]
 * - termsAccepted: boolean
 * - submitting: boolean
 * - onTermsChange: (accepted: boolean) => void
 * - onPay: (method: PaymentMethod) => void
 *
 * Comportamientos cubiertos:
 * - Muestra el heading "SELECCIONE EL METODO DE PAGO"
 * - Muestra una card por cada metodo de pago recibido
 * - Los botones de pago estan deshabilitados cuando termsAccepted=false
 * - Los botones de pago estan habilitados cuando termsAccepted=true
 * - Muestra el checkbox "He leido y aceptado los terminos y condiciones"
 * - Al cambiar el checkbox llama onTermsChange con el nuevo valor
 * - Al hacer click en PAGAR de un metodo llama onPay con el id del metodo
 */

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import PaymentMethodSelector from '../components/step-confirmar/PaymentMethodSelector'
import { PAYMENT_METHODS } from '../types/payment'
import type { PaymentMethod, PaymentMethodOption } from '../types/payment'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockOnTermsChange = vi.fn()
const mockOnPay = vi.fn()

interface RenderOptions {
  methods?: PaymentMethodOption[]
  termsAccepted?: boolean
  submitting?: boolean
}

function renderSelector({
  methods = PAYMENT_METHODS,
  termsAccepted = false,
  submitting = false,
}: RenderOptions = {}) {
  return render(
    <PaymentMethodSelector
      methods={methods}
      termsAccepted={termsAccepted}
      submitting={submitting}
      onTermsChange={mockOnTermsChange}
      onPay={mockOnPay}
    />,
  )
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ---------------------------------------------------------------------------
// Tests: renderizado
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — renderizado', () => {
  it('should_render_heading_seleccione_metodo_de_pago', () => {
    // Arrange / Act
    renderSelector()

    // Assert
    expect(screen.getByText('SELECCIONE EL MÉTODO DE PAGO')).toBeInTheDocument()
  })

  it('should_render_four_payment_method_cards_by_default', () => {
    // Arrange / Act
    renderSelector()

    // Assert — los 4 metodos del array PAYMENT_METHODS
    expect(screen.getByText('TARJETA DE CREDITO')).toBeInTheDocument()
    expect(screen.getByText('BIZUM')).toBeInTheDocument()
    expect(screen.getByText('PAYPAL')).toBeInTheDocument()
    expect(screen.getByText('TRANSFERENCIA BANCARIA')).toBeInTheDocument()
  })

  it('should_render_only_provided_methods', () => {
    // Arrange
    const singleMethod: PaymentMethodOption[] = [
      { id: 'bizum', label: 'BIZUM', buttonLabel: 'PAGAR' },
    ]

    // Act
    renderSelector({ methods: singleMethod })

    // Assert
    expect(screen.getByText('BIZUM')).toBeInTheDocument()
    expect(screen.queryByText('PAYPAL')).not.toBeInTheDocument()
    expect(screen.queryByText('TARJETA DE CREDITO')).not.toBeInTheDocument()
  })

  it('should_render_terms_checkbox', () => {
    // Arrange / Act
    renderSelector()

    // Assert
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('should_render_terms_text', () => {
    // Arrange / Act
    renderSelector()

    // Assert — el texto del checkbox de terminos
    expect(screen.getByText(/terminos y condiciones/i)).toBeInTheDocument()
  })
})

// ---------------------------------------------------------------------------
// Tests: estado de botones segun termsAccepted
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — estado de botones de pago', () => {
  it('should_disable_all_pay_buttons_when_terms_not_accepted', () => {
    // Arrange / Act
    renderSelector({ termsAccepted: false })

    // Assert — todos los botones "PAGAR" / "Pay with PayPal" deshabilitados
    const pagarButtons = screen.getAllByRole('button', { name: /PAGAR|Pay with PayPal/i })
    pagarButtons.forEach((btn) => {
      expect(btn).toBeDisabled()
    })
  })

  it('should_enable_all_pay_buttons_when_terms_accepted', () => {
    // Arrange / Act
    renderSelector({ termsAccepted: true })

    // Assert — todos los botones habilitados
    const pagarButtons = screen.getAllByRole('button', { name: /PAGAR|Pay with PayPal/i })
    pagarButtons.forEach((btn) => {
      expect(btn).not.toBeDisabled()
    })
  })

  it('should_show_terms_checkbox_as_unchecked_when_terms_not_accepted', () => {
    // Arrange / Act
    renderSelector({ termsAccepted: false })

    // Assert
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('should_show_terms_checkbox_as_checked_when_terms_accepted', () => {
    // Arrange / Act
    renderSelector({ termsAccepted: true })

    // Assert
    expect(screen.getByRole('checkbox')).toBeChecked()
  })
})

// ---------------------------------------------------------------------------
// Tests: interaccion con checkbox de terminos
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — interaccion con checkbox', () => {
  it('should_call_onTermsChange_with_true_when_checkbox_clicked_while_unchecked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderSelector({ termsAccepted: false })

    // Act
    await user.click(screen.getByRole('checkbox'))

    // Assert
    expect(mockOnTermsChange).toHaveBeenCalledWith(true)
    expect(mockOnTermsChange).toHaveBeenCalledTimes(1)
  })

  it('should_call_onTermsChange_with_false_when_checkbox_clicked_while_checked', async () => {
    // Arrange
    const user = userEvent.setup()
    renderSelector({ termsAccepted: true })

    // Act
    await user.click(screen.getByRole('checkbox'))

    // Assert
    expect(mockOnTermsChange).toHaveBeenCalledWith(false)
    expect(mockOnTermsChange).toHaveBeenCalledTimes(1)
  })
})

// ---------------------------------------------------------------------------
// Tests: interaccion con botones de pago
// ---------------------------------------------------------------------------

describe('PaymentMethodSelector — interaccion con botones de pago', () => {
  it('should_call_onPay_with_credit_card_method_when_credit_card_pagar_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const creditCardOnly: PaymentMethodOption[] = [
      { id: 'credit-card', label: 'TARJETA DE CREDITO', buttonLabel: 'PAGAR' },
    ]
    renderSelector({ methods: creditCardOnly, termsAccepted: true })

    // Act
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(mockOnPay).toHaveBeenCalledWith('credit-card' as PaymentMethod)
    expect(mockOnPay).toHaveBeenCalledTimes(1)
  })

  it('should_call_onPay_with_paypal_method_when_paypal_button_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const paypalOnly: PaymentMethodOption[] = [
      { id: 'paypal', label: 'PAYPAL', buttonLabel: 'Pay with PayPal' },
    ]
    renderSelector({ methods: paypalOnly, termsAccepted: true })

    // Act
    await user.click(screen.getByRole('button', { name: 'Pay with PayPal' }))

    // Assert
    expect(mockOnPay).toHaveBeenCalledWith('paypal' as PaymentMethod)
  })

  it('should_call_onPay_with_bizum_method_when_bizum_pagar_clicked', async () => {
    // Arrange
    const user = userEvent.setup()
    const bizumOnly: PaymentMethodOption[] = [{ id: 'bizum', label: 'BIZUM', buttonLabel: 'PAGAR' }]
    renderSelector({ methods: bizumOnly, termsAccepted: true })

    // Act
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(mockOnPay).toHaveBeenCalledWith('bizum' as PaymentMethod)
  })

  it('should_not_call_onPay_when_terms_not_accepted', async () => {
    // Arrange
    const user = userEvent.setup()
    const creditCardOnly: PaymentMethodOption[] = [
      { id: 'credit-card', label: 'TARJETA DE CREDITO', buttonLabel: 'PAGAR' },
    ]
    renderSelector({ methods: creditCardOnly, termsAccepted: false })

    // Act — intentar click con boton deshabilitado
    await user.click(screen.getByRole('button', { name: 'PAGAR' }))

    // Assert
    expect(mockOnPay).not.toHaveBeenCalled()
  })

  it('should_call_correct_onPay_method_in_multi_method_list', async () => {
    // Arrange
    const user = userEvent.setup()
    const twoMethods: PaymentMethodOption[] = [
      { id: 'bizum', label: 'BIZUM', buttonLabel: 'PAGAR' },
      { id: 'paypal', label: 'PAYPAL', buttonLabel: 'Pay with PayPal' },
    ]
    renderSelector({ methods: twoMethods, termsAccepted: true })

    // Act — hacer click en el boton de PayPal especificamente
    await user.click(screen.getByRole('button', { name: 'Pay with PayPal' }))

    // Assert — se llamo con paypal, no con bizum
    expect(mockOnPay).toHaveBeenCalledWith('paypal' as PaymentMethod)
    expect(mockOnPay).not.toHaveBeenCalledWith('bizum')
  })
})
