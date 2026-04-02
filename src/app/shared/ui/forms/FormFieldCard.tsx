import type { ReactNode } from 'react'
import { cn } from '@/app/shared/utils/utils'

interface FormFieldCardProps {
  label: string
  children: ReactNode
  className?: string
}

export function FormFieldCard({ label, children, className }: FormFieldCardProps) {
  return (
    <div className={cn('flex flex-col gap-2.5', className)}>
      <label className="text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  )
}
