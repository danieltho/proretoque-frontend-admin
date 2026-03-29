/**
 * Shared delivery enums — mirror of backend App\Shared\Enum\DeliveryTimeEnum
 *
 * Values MUST match the backend enum values exactly.
 * Used by both orders (batches) and quotes (protocols).
 */

export const DeliveryTime = {
  HOUR12: '12hs',
  HOUR24: '24hs',
  HOUR48: '48hs',
  HOUR72: '72hs',
  HOUR72M: '72hs+',
} as const

export type DeliveryTime = (typeof DeliveryTime)[keyof typeof DeliveryTime]

export const DELIVERY_TIMES = [
  { value: DeliveryTime.HOUR12, label: '12HS', surcharge: '100%' },
  { value: DeliveryTime.HOUR24, label: '24HS', surcharge: '50%' },
  { value: DeliveryTime.HOUR48, label: '48HS', surcharge: '25%' },
  { value: DeliveryTime.HOUR72, label: '72HS', surcharge: '0%' },
  { value: DeliveryTime.HOUR72M, label: '72HS+', surcharge: '-5%' },
] as const
