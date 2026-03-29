import { format, parseISO } from 'date-fns'

/**
 * Format an ISO date string as DD/MM/YYYY
 */
export function formatDateShort(isoString: string | null | undefined): string {
  if (!isoString) return '-'
  return format(parseISO(isoString), 'dd/MM/yyyy')
}

/**
 * Format an ISO date string as DD/MM/YY HH:mm
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-'
  return format(parseISO(isoString), 'dd/MM/yy HH:mm')
}

/**
 * Format an ISO date string as HH:mm
 */
export function formatTime(isoString: string | null | undefined): string {
  if (!isoString) return '-'
  return format(parseISO(isoString), 'HH:mm')
}
