import { useState, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/app/components/ui/dialog'

interface InputModalProps {
  open: boolean
  title: string
  description?: string
  placeholder?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: (value: string) => void
  onCancel: () => void
}

export function InputModal({
  open,
  title,
  description,
  placeholder = '',
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: InputModalProps) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (open) setValue('')
  }, [open])

  const handleConfirm = () => {
    if (value.trim()) {
      onConfirm(value.trim())
    }
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <DialogContent className="w-[340px] gap-4 rounded-[20px] p-6 font-[Raleway,sans-serif] sm:max-w-[340px]">
        <DialogHeader className="gap-4 space-y-0">
          <DialogTitle className="text-[26px] font-semibold leading-[31.2px]">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-base font-medium text-foreground">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="h-9"
          onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
        />

        <DialogFooter className="flex-row gap-6 sm:flex-row">
          <Button
            className="flex-1 rounded-[10px]"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button
            className="flex-1 rounded-[10px]"
            disabled={loading || !value.trim()}
            onClick={handleConfirm}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
