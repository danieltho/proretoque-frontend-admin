export type FilterValue = string | number | boolean | (string | number)[]

export type Filters = Record<string, FilterValue | undefined>

/**
 * Serializes a filters object into flat query params with `filters[key]` format.
 *
 * - Scalar values: `filters[name]=value`
 * - Array values:  `filters[categories][0]=1&filters[categories][1]=2`
 * - Undefined/empty values are skipped
 */
export function buildFilterParams(filters: Filters): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {}

  for (const [key, value] of Object.entries(filters)) {
    if (value === undefined || value === '') continue

    if (Array.isArray(value)) {
      if (value.length === 0) continue
      value.forEach((item, i) => {
        params[`filters[${key}][${i}]`] = item
      })
    } else {
      params[`filters[${key}]`] = value
    }
  }

  return params
}
