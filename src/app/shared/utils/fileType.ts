import {
  FilePdf,
  FileDoc,
  FileXls,
  FileCsv,
  FileText,
  File as FileIcon,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'

interface FileInfo {
  fileName: string
  mimeType: string
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/tiff', 'image/webp', 'image/bmp']

export function isImageFile(file: FileInfo): boolean {
  return IMAGE_TYPES.includes(file.mimeType) || file.mimeType.startsWith('image/')
}

export function getFileExtLabel(file: FileInfo): string {
  const ext = file.fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'JPEG'
    case 'png':
      return 'PNG'
    case 'tiff':
    case 'tif':
      return 'TIFF'
    case 'psd':
      return 'PSD'
    case 'webp':
      return 'WEBP'
    case 'pdf':
      return 'PDF'
    case 'doc':
    case 'docx':
      return 'DOC'
    case 'xls':
    case 'xlsx':
      return 'XLS'
    case 'csv':
      return 'CSV'
    case 'txt':
      return 'TXT'
    default:
      return ext?.toUpperCase() ?? '—'
  }
}

export function getFileIcon(file: FileInfo): Icon {
  const ext = file.fileName.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'pdf':
      return FilePdf
    case 'doc':
    case 'docx':
      return FileDoc
    case 'xls':
    case 'xlsx':
      return FileXls
    case 'csv':
      return FileCsv
    case 'txt':
      return FileText
    default:
      return FileIcon
  }
}
