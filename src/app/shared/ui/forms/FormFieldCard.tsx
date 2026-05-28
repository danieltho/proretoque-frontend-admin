import { useId, type ReactNode } from 'react'
import { cn } from '@/app/shared/utils/utils'
import { FormFieldContext } from './formFieldContext'

interface FormFieldCardProps {
  label: string
  /** Optional error message — when present, the field is marked invalid and
   *  the message is announced to assistive tech via aria-describedby. */
  error?: string
  /** Override the generated field id (rarely needed). */
  id?: string
  children: ReactNode
  className?: string
}

export function FormFieldCard({ label, error, id, children, className }: FormFieldCardProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId
  const errorId = `${fieldId}-error`
  const hasError = Boolean(error)

  return (
    <FormFieldContext.Provider value={{ id: fieldId, errorId, hasError }}>
      <div className={cn('flex flex-col gap-2.5', className)}>
        <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
          {label}
        </label>
        {children}
        {hasError && (
          <span id={errorId} role="alert" className="text-sm text-error-text">
            {error}
          </span>
        )}
      </div>
    </FormFieldContext.Provider>
  )
}
