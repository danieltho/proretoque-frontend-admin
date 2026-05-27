import { describe, it, expect } from 'vitest'
import { parseRouteId } from '../routeId'

describe('parseRouteId', () => {
  it('returns the number for a valid positive integer string', () => {
    expect(parseRouteId('5')).toBe(5)
    expect(parseRouteId('123')).toBe(123)
  })

  it('returns null for non-numeric strings', () => {
    expect(parseRouteId('abc')).toBeNull()
    expect(parseRouteId('12x')).toBeNull()
  })

  it('returns null for empty or undefined input', () => {
    expect(parseRouteId('')).toBeNull()
    expect(parseRouteId(undefined)).toBeNull()
  })

  it('returns null for zero and negative numbers', () => {
    expect(parseRouteId('0')).toBeNull()
    expect(parseRouteId('-3')).toBeNull()
  })

  it('returns null for non-integer numbers', () => {
    expect(parseRouteId('1.5')).toBeNull()
  })
})
