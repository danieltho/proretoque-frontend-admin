import type { ReactNode } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog'
import { cn } from '@/app/shared/utils/utils'

type DialogSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'fullScreen'

const sizeClasses: Record<DialogSize, string> = {
  xs: 'sm:max-w-xs',
  sm: 'sm:max-w-sm',
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
  full: 'sm:max-w-full m-2.5',
  fullScreen: 'sm:max-w-none h-screen w-screen rounded-none flex flex-col',
}

interface DialogModalProps {
  children: ReactNode
  title: string
  open: boolean
  onClose: () => void
  size?: DialogSize
  className?: string
  showCloseButton?: boolean
  closeIconClassName?: string
}

export default function DialogModal({
  children,
  title,
  open,
  onClose,
  size = 'md',
  className,
  showCloseButton = true,
  closeIconClassName = 'size-8 ',
}: DialogModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        className={cn(sizeClasses[size], className)}
        showCloseButton={showCloseButton}
        closeIconClassName={closeIconClassName}
      >
        <DialogHeader className="flex-row items-center justify-between">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  )
}
