const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/tiff', 'image/webp'])
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024 // 50 MB
const MAX_FILES_PER_UPLOAD = 100

// Allowed file extensions as secondary check (defense in depth)
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.tiff', '.tif', '.webp'])

export interface FileValidationResult {
  valid: File[]
  errors: string[]
}

/**
 * Extracts the file extension from a filename (lowercased, with dot).
 * Returns empty string if no extension found.
 */
function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.')
  if (lastDot === -1 || lastDot === filename.length - 1) return ''
  return filename.slice(lastDot).toLowerCase()
}

/**
 * Sanitizes a file name by removing path separators and null bytes.
 * This prevents path traversal attacks when file names are sent to the server.
 */
export function sanitizeFileName(name: string): string {
  return name.replace(/[/\\:\0]/g, '_')
}

/**
 * Validates a list of files against allowed MIME types, file extensions,
 * maximum file size, and batch count limits.
 *
 * Allowed types: JPEG, PNG, TIFF, WEBP
 * Maximum size: 50 MB per file
 * Maximum batch: 100 files per upload
 *
 * A single file can produce multiple errors (e.g., bad type AND oversized).
 * Only files that pass ALL validations are included in the `valid` array.
 */
export function validateFiles(files: File[]): FileValidationResult {
  const valid: File[] = []
  const errors: string[] = []

  // Batch count limit
  if (files.length > MAX_FILES_PER_UPLOAD) {
    errors.push(
      `Se seleccionaron ${files.length} archivos, el máximo por carga es ${MAX_FILES_PER_UPLOAD}`,
    )
    return { valid: [], errors }
  }

  for (const file of files) {
    const fileErrors: string[] = []
    const safeName = sanitizeFileName(file.name)

    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      fileErrors.push(`${safeName}: formato no permitido (solo JPG, PNG, TIFF, WEBP)`)
    }

    // Defense-in-depth: also check file extension
    const ext = getFileExtension(file.name)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      fileErrors.push(`${safeName}: extensión de archivo no permitida`)
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      fileErrors.push(`${safeName}: excede el tamaño máximo de 50 MB`)
    }

    if (file.size === 0) {
      fileErrors.push(`${safeName}: el archivo está vacío`)
    }

    if (fileErrors.length === 0) {
      valid.push(file)
    } else {
      errors.push(...fileErrors)
    }
  }

  return { valid, errors }
}
