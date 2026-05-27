import type { ReactNode } from 'react'

export default function Card({ children }: { children: ReactNode }) {
  return <div className="flex flex-col rounded-2xl p-4 gap-4 bg-white">{children}</div>
}
