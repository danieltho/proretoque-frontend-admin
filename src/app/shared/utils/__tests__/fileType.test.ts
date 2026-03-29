import { describe, it, expect } from 'vitest'
import { isImageFile, getFileExtLabel, getFileIcon } from '../fileType'
import {
  FilePdf,
  FileDoc,
  FileXls,
  FileCsv,
  FileText,
  File as FileIcon,
} from '@phosphor-icons/react'

function makeFile(name: string, type = '') {
  return { fileName: name, mimeType: type }
}

describe('isImageFile', () => {
  it('should_return_true_for_jpeg', () => {
    expect(isImageFile(makeFile('foto.jpg', 'image/jpeg'))).toBe(true)
  })

  it('should_return_true_for_png', () => {
    expect(isImageFile(makeFile('foto.png', 'image/png'))).toBe(true)
  })

  it('should_return_true_for_tiff', () => {
    expect(isImageFile(makeFile('foto.tif', 'image/tiff'))).toBe(true)
  })

  it('should_return_true_for_webp', () => {
    expect(isImageFile(makeFile('foto.webp', 'image/webp'))).toBe(true)
  })

  it('should_return_true_for_any_image_type', () => {
    expect(isImageFile(makeFile('foto.bmp', 'image/bmp'))).toBe(true)
  })

  it('should_return_false_for_pdf', () => {
    expect(isImageFile(makeFile('doc.pdf', 'application/pdf'))).toBe(false)
  })

  it('should_return_false_for_empty_type', () => {
    expect(isImageFile(makeFile('file.xyz', ''))).toBe(false)
  })
})

describe('getFileExtLabel', () => {
  it('should_return_JPEG_for_jpg', () => {
    expect(getFileExtLabel(makeFile('foto.jpg'))).toBe('JPEG')
  })

  it('should_return_JPEG_for_jpeg', () => {
    expect(getFileExtLabel(makeFile('foto.jpeg'))).toBe('JPEG')
  })

  it('should_return_PNG_for_png', () => {
    expect(getFileExtLabel(makeFile('foto.png'))).toBe('PNG')
  })

  it('should_return_TIFF_for_tif', () => {
    expect(getFileExtLabel(makeFile('foto.tif'))).toBe('TIFF')
  })

  it('should_return_PSD_for_psd', () => {
    expect(getFileExtLabel(makeFile('foto.psd'))).toBe('PSD')
  })

  it('should_return_PDF_for_pdf', () => {
    expect(getFileExtLabel(makeFile('doc.pdf'))).toBe('PDF')
  })

  it('should_return_DOC_for_docx', () => {
    expect(getFileExtLabel(makeFile('doc.docx'))).toBe('DOC')
  })

  it('should_return_XLS_for_xlsx', () => {
    expect(getFileExtLabel(makeFile('data.xlsx'))).toBe('XLS')
  })

  it('should_return_CSV_for_csv', () => {
    expect(getFileExtLabel(makeFile('data.csv'))).toBe('CSV')
  })

  it('should_return_uppercase_extension_for_unknown', () => {
    expect(getFileExtLabel(makeFile('file.zip'))).toBe('ZIP')
  })
})

describe('getFileIcon', () => {
  it('should_return_FilePdf_for_pdf', () => {
    expect(getFileIcon(makeFile('doc.pdf'))).toBe(FilePdf)
  })

  it('should_return_FileDoc_for_docx', () => {
    expect(getFileIcon(makeFile('doc.docx'))).toBe(FileDoc)
  })

  it('should_return_FileXls_for_xlsx', () => {
    expect(getFileIcon(makeFile('data.xlsx'))).toBe(FileXls)
  })

  it('should_return_FileCsv_for_csv', () => {
    expect(getFileIcon(makeFile('data.csv'))).toBe(FileCsv)
  })

  it('should_return_FileText_for_txt', () => {
    expect(getFileIcon(makeFile('readme.txt'))).toBe(FileText)
  })

  it('should_return_FileIcon_for_unknown', () => {
    expect(getFileIcon(makeFile('archive.zip'))).toBe(FileIcon)
  })
})
