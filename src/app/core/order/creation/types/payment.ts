export type PaymentMethod = 'credit-card' | 'bizum' | 'paypal' | 'bank-transfer'

export interface PaymentMethodOption {
  id: PaymentMethod
  label: string
  buttonLabel: string
}

export const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: 'credit-card',
    label: 'TARJETA DE CREDITO',
    buttonLabel: 'PAGAR',
  },
  {
    id: 'bizum',
    label: 'BIZUM',
    buttonLabel: 'PAGAR',
  },
  {
    id: 'paypal',
    label: 'PAYPAL',
    buttonLabel: 'Pay with PayPal',
  },
  {
    id: 'bank-transfer',
    label: 'TRANSFERENCIA BANCARIA',
    buttonLabel: 'PAGAR',
  },
]
