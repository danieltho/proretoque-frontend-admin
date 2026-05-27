/**
 * Convierte un parámetro de ruta (`useParams`) en un id entero positivo.
 * Devuelve `null` si el parámetro falta o no es un id válido, evitando que un
 * `NaN` llegue a la API cuando la URL contiene algo como `/users/abc/edit`.
 */
export function parseRouteId(param: string | undefined): number | null {
  if (!param) return null
  const id = Number(param)
  return Number.isInteger(id) && id > 0 ? id : null
}
