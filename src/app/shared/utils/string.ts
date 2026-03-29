/**
 * Truncates a string to a maximum number of characters without splitting words.
 * Appends an ellipsis (…) if truncation occurs.
 */
export function truncateLabel(text: string, maxChars = 20): string {
  if (text.length <= maxChars) return text
  const cut = text.lastIndexOf(' ', maxChars)
  return (cut > 0 ? text.slice(0, cut) : text.slice(0, maxChars)) + '…'
}
