import type { ReactNode } from 'react'
import { CaretLeftIcon, CaretRightIcon, type Icon } from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { Button, type ButtonVariant } from '@/app/components/ui/button'

export interface BreadcrumbItem {
  label: string
  href?: string
}

interface TitleSectionProps {
  breadcrumbs?: BreadcrumbItem[]
  title: string
  onBack?: () => void
  action?: {
    label: string
    icon?: Icon
    onClick: () => void
    variant?: ButtonVariant['variant']
  }
  actions?: {
    label: string
    icon?: Icon
    onClick: () => void
    variant?: ButtonVariant['variant']
  }[]
  description?: ReactNode
  className?: string
}

export function TitleSection({
  breadcrumbs,
  title,
  onBack,
  action,
  actions,
  description,
  className,
}: TitleSectionProps) {
  return (
    <div className={cn('flex flex-col gap-2.5 font-raleway', className)}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1
            return (
              <span key={item.label} className="flex items-center gap-1.5">
                {index > 0 && <CaretRightIcon className="size-3.5 text-muted-foreground" />}
                <span
                  className={cn(
                    'text-footer',
                    isLast ? 'font-medium text-neutral-600' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </span>
              </span>
            )
          })}
        </nav>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="shrink-0 cursor-pointer"
              aria-label="Volver"
            >
              <CaretLeftIcon className="size-6" weight="bold" />
            </button>
          )}
          <h1 className="text-h1 font-bold text-neutral-600">{title}</h1>
        </div>

        {(action || actions) && (
          <div className="ml-2 flex items-center gap-2">
            {action && (
              <Button
                variant={action.variant ?? 'ghost'}
                size="sm"
                onClick={action.onClick}
                className="gap-2 text-base font-medium"
              >
                {action.icon && <action.icon />}
                {action.label}
              </Button>
            )}
            {actions?.map((act) => (
              <Button
                key={act.label}
                variant={act.variant ?? 'ghost'}
                size="sm"
                onClick={act.onClick}
                className="gap-2 text-base font-medium"
              >
                {act.icon && <act.icon />}
                {act.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {description && (
        <div className="flex items-center gap-4 text-body text-neutral-600">{description}</div>
      )}
    </div>
  )
}
