import { createContext, useContext } from 'react'

// Context provided by FormFieldCard so children inputs can pick up the field id,
// the error message id and the invalid state automatically — no need to wire
// `id`, `aria-invalid` and `aria-describedby` by hand on each consumer.
export interface FormFieldContextValue {
  id: string
  errorId: string
  hasError: boolean
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null)

/**
 * Merges consumer-provided field props with the surrounding FormFieldCard
 * context. Explicit props always win over the context.
 */
export function useFormFieldProps<P>(props: P): P {
  const ctx = useContext(FormFieldContext)
  if (!ctx) return props
  const p = props as Record<string, unknown>
  return {
    ...p,
    id: p.id ?? ctx.id,
    'aria-invalid': p['aria-invalid'] ?? (ctx.hasError || undefined),
    'aria-describedby': p['aria-describedby'] ?? (ctx.hasError ? ctx.errorId : undefined),
  } as P
}
