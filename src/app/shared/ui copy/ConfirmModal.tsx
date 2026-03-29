import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface ConfirmModalProps {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
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

        <DialogFooter className="flex-row gap-6 sm:flex-row">
          <Button
            className="flex-1 rounded-[10px]"
            variant="outline"
            disabled={loading}
            onClick={onCancel}
          >
            {cancelLabel}
          </Button>
          <Button className="flex-1 rounded-[10px]" disabled={loading} onClick={onConfirm}>
            {loading ? 'Procesando...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
