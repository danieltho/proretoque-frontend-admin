import { useEffect } from 'react'
import { useBlocker } from 'react-router-dom'

/**
 * Protege cambios sin guardar en dos escenarios:
 * - Escenario 2: navegación por React Router (sidebar, botón atrás)
 * - Escenario 3: cierre de browser o refresh (beforeunload)
 *
 * Devuelve el `blocker` para que el componente muestre su propio modal
 * cuando `blocker.state === 'blocked'`.
 */
export function useUnsavedChanges(isDirty: boolean) {
  // Escenario 3: browser close / refresh
  useEffect(() => {
    if (!isDirty) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  // Escenario 2: React Router navigation
  const blocker = useBlocker(isDirty)

  return { blocker }
}
