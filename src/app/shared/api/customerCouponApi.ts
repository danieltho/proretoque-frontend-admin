import alovaInstance from './alovaInstance'

export type CustomerCoupon = {
  coupon_id: number
  created: string
  code: string
  name: string
  desc: string
  last_used: string | null
  amount: number | string
}

export const getCouponsApi = () =>
  alovaInstance.Get<{ data: CustomerCoupon[] }>('/customers/me/coupons')

export const addCouponApi = (code: string) =>
  alovaInstance.Post<void>('/customers/me/coupons', { code })

export const removeCouponApi = (couponId: number) =>
  alovaInstance.Delete<void>(`/customers/me/coupons/${couponId}`)
