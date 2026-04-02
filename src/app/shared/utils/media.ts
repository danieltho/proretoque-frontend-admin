import type { MediaItem } from '@/app/shared/types/media'

export function fileToMediaItem(file: File, preview: string): MediaItem {
  return {
    src: preview,
    name: file.name,
    fileName: file.name,
    mimeType: file.type,
    size: file.size,
  }
}
