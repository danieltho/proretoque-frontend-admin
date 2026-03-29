import { create } from 'zustand'

interface OrdersState {
  selectedOrderId: number | null
  setSelectedOrder: (id: number | null) => void
}

export const useOrdersStore = create<OrdersState>()((set) => ({
  selectedOrderId: null,
  setSelectedOrder: (id) => set({ selectedOrderId: id }),
}))
