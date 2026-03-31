import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Hook que previene navegacion no intencionada cuando hay cambios sin guardar.
 *
 * - Bloquea navegacion en React Router cuando isDirty y no submitting
 * - Agrega beforeunload listener para advertir al usuario si intenta cerrar la pestaña
 * - Limpia listeners en el cleanup del effect
 *
 * @param isDirty - si hay cambios sin guardar
 * @param submitting - si se esta procesando el submit (no mostrar advertencia)
 * @returns blocker para validar navegacion
 */
export function useUnsavedGuard(isDirty: boolean, submitting: boolean) {
  const blocker = useBlocker(() => isDirty && !submitting)

  useEffect(() => {
    // Guard: don't add listener if not dirty or if submitting
    if (!isDirty || submitting) return

    // Handler to prevent page unload when there are unsaved changes
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      // This property is deprecated but still needed for some browsers
      e.returnValue = ''
    }

    // Add listener with capture=false (default) for better performance
    window.addEventListener('beforeunload', handler, false)

    // Cleanup: remove listener when component unmounts or deps change
    return () => {
      window.removeEventListener('beforeunload', handler, false)
    }
  }, [isDirty, submitting])

  return blocker
}
