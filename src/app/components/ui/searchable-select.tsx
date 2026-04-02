import * as React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Check as CheckIcon,
  CaretDown as CaretDownIcon,
  MagnifyingGlass as SearchIcon,
  X as XIcon,
} from '@phosphor-icons/react'
import { useTranslation } from 'react-i18next'
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from 'react-hook-form'

import { cn } from '@/app/shared/utils/utils'
import { Badge } from '@/app/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/app/components/ui/popover'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchableSelectOption {
  id: string | number
  label: string
  disabled?: boolean
}

interface SearchableSelectBaseProps {
  /** List of options to display */
  options: SearchableSelectOption[]
  /** Placeholder shown when nothing is selected */
  placeholder?: string
  /** Text shown when search yields no results */
  emptyMessage?: string
  /** Controlled search value */
  searchValue?: string
  /** Called when the user types in the search input */
  onSearch?: (value: string) => void
  /** Whether the dropdown is disabled */
  disabled?: boolean
  /** Extra class names for the trigger button */
  className?: string
  /** Field name (used by react-hook-form) */
  name?: string
  /** Called when the trigger loses focus (used by react-hook-form) */
  onBlur?: () => void
  /** Whether the field has a validation error */
  hasError?: boolean

  // Pagination
  /** Whether there are more items to load */
  hasMore?: boolean
  /** Called when the user scrolls near the bottom */
  onLoadMore?: () => void
  /** Show a loading indicator at the bottom of the list */
  isLoading?: boolean
}

interface SingleSelectProps extends SearchableSelectBaseProps {
  multiple?: false
  /** Currently selected id (single mode) */
  value?: string | number | null
  /** Called when the selection changes (single mode) */
  onChange?: (value: string | number | null) => void
}

interface MultiSelectProps extends SearchableSelectBaseProps {
  multiple: true
  /** Currently selected ids (multi mode) */
  value?: (string | number)[]
  /** Called when the selection changes (multi mode) */
  onChange?: (value: (string | number)[]) => void
}

export type SearchableSelectProps = SingleSelectProps | MultiSelectProps

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SearchableSelect(props: SearchableSelectProps) {
  const {
    options,
    placeholder,
    emptyMessage,
    searchValue: controlledSearch,
    onSearch,
    disabled = false,
    className,
    name,
    onBlur,
    hasError = false,
    hasMore = false,
    onLoadMore,
    isLoading = false,
    multiple = false,
  } = props

  const { t } = useTranslation()

  const [open, setOpen] = useState(false)
  const [internalSearch, setInternalSearch] = useState('')
  const listRef = useRef<HTMLDivElement>(null)

  const searchValue = controlledSearch ?? internalSearch

  const handleSearchChange = useCallback(
    (val: string) => {
      if (onSearch) {
        onSearch(val)
      } else {
        setInternalSearch(val)
      }
    },
    [onSearch],
  )

  // Local filtering only when search is NOT controlled externally
  const filteredOptions = useMemo(() => {
    if (onSearch) return options // filtering is handled externally
    if (!searchValue) return options
    const lower = searchValue.toLowerCase()
    return options.filter((o) => o.label.toLowerCase().includes(lower))
  }, [options, searchValue, onSearch])

  // Infinite-scroll: detect when user scrolls near the bottom
  useEffect(() => {
    const el = listRef.current
    if (!el || !hasMore || !onLoadMore) return

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = el
      if (scrollHeight - scrollTop - clientHeight < 40) {
        onLoadMore()
      }
    }

    el.addEventListener('scroll', handleScroll)
    return () => el.removeEventListener('scroll', handleScroll)
  }, [hasMore, onLoadMore])

  // Reset internal search when popover closes
  useEffect(() => {
    if (!open) setInternalSearch('')
  }, [open])

  // ---- Selection helpers ----

  const isSelected = useCallback(
    (id: string | number) => {
      if (multiple) {
        return ((props as MultiSelectProps).value ?? []).includes(id)
      }
      return (props as SingleSelectProps).value === id
    },
    [multiple, props],
  )

  const handleSelect = useCallback(
    (id: string | number) => {
      if (multiple) {
        const mp = props as MultiSelectProps
        const current = mp.value ?? []
        const next = current.includes(id)
          ? current.filter((v) => v !== id)
          : [...current, id]
        mp.onChange?.(next)
      } else {
        const sp = props as SingleSelectProps
        sp.onChange?.(sp.value === id ? null : id)
        setOpen(false)
      }
    },
    [multiple, props],
  )

  const handleRemove = useCallback(
    (id: string | number) => {
      if (multiple) {
        const mp = props as MultiSelectProps
        const current = mp.value ?? []
        mp.onChange?.(current.filter((v) => v !== id))
      }
    },
    [multiple, props],
  )

  const handleClear = useCallback(() => {
    if (multiple) {
      ;(props as MultiSelectProps).onChange?.([])
    } else {
      ;(props as SingleSelectProps).onChange?.(null)
    }
  }, [multiple, props])

  // ---- Display helpers ----

  const selectedLabels = useMemo(() => {
    if (multiple) {
      const ids = (props as MultiSelectProps).value ?? []
      return ids
        .map((id) => options.find((o) => o.id === id))
        .filter(Boolean) as SearchableSelectOption[]
    }
    const id = (props as SingleSelectProps).value
    if (id == null) return []
    const found = options.find((o) => o.id === id)
    return found ? [found] : []
  }, [multiple, options, props])

  const hasValue = selectedLabels.length > 0

  const placeholderText =
    placeholder ?? t('searchableSelect.placeholder', 'Seleccionar...')
  const emptyText =
    emptyMessage ?? t('searchableSelect.empty', 'Sin resultados')

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={hasError || undefined}
          name={name}
          onBlur={onBlur}
          className={cn(
            'border-input dark:bg-input/30 flex min-h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none',
            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'aria-invalid:border-destructive aria-invalid:ring-destructive/20',
            className,
          )}
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1 overflow-hidden">
            {!hasValue && (
              <span className="text-muted-foreground truncate">
                {placeholderText}
              </span>
            )}

            {multiple && hasValue
              ? selectedLabels.map((opt) => (
                  <Badge
                    key={opt.id}
                    variant="secondary"
                    className="max-w-[120px] gap-1 truncate"
                  >
                    <span className="truncate">{opt.label}</span>
                    <button
                      type="button"
                      className="ml-0.5 rounded-full outline-none hover:opacity-70"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemove(opt.id)
                      }}
                    >
                      <XIcon className="size-3" />
                    </button>
                  </Badge>
                ))
              : hasValue && (
                  <span className="truncate">{selectedLabels[0].label}</span>
                )}
          </span>

          <span className="flex shrink-0 items-center gap-1">
            {hasValue && (
              <span
                role="button"
                tabIndex={0}
                className="text-muted-foreground hover:text-foreground rounded-full p-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClear()
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation()
                    handleClear()
                  }
                }}
              >
                <XIcon className="size-3.5" />
              </span>
            )}
            <CaretDownIcon className="text-muted-foreground size-4" />
          </span>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] p-0"
        align="start"
      >
        {/* Search input */}
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <SearchIcon className="text-muted-foreground size-4 shrink-0" />
          <input
            className="placeholder:text-muted-foreground flex-1 bg-transparent text-sm outline-none"
            placeholder={t('searchableSelect.search', 'Buscar...')}
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Options list */}
        <div
          ref={listRef}
          className="max-h-60 overflow-y-auto scroll-py-1 p-1"
        >
          {filteredOptions.length === 0 && !isLoading && (
            <p className="text-muted-foreground py-4 text-center text-sm">
              {emptyText}
            </p>
          )}

          {filteredOptions.map((option) => {
            const selected = isSelected(option.id)
            return (
              <button
                key={option.id}
                type="button"
                disabled={option.disabled}
                className={cn(
                  'relative flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none',
                  'hover:bg-accent hover:text-accent-foreground',
                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                  selected && 'bg-accent/50',
                )}
                data-disabled={option.disabled || undefined}
                onClick={() => handleSelect(option.id)}
              >
                {multiple && (
                  <span
                    className={cn(
                      'border-input flex size-4 shrink-0 items-center justify-center rounded-[4px] border shadow-xs',
                      selected && 'bg-primary border-primary text-primary-foreground',
                    )}
                  >
                    {selected && <CheckIcon className="size-3" />}
                  </span>
                )}
                <span className="truncate">{option.label}</span>
                {!multiple && selected && (
                  <CheckIcon className="text-primary ml-auto size-4 shrink-0" />
                )}
              </button>
            )
          })}

          {/* Loading / pagination */}
          {isLoading && (
            <p className="text-muted-foreground py-2 text-center text-xs">
              {t('searchableSelect.loading', 'Cargando...')}
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// React Hook Form wrapper
// ---------------------------------------------------------------------------

type FormSearchableSelectBaseProps<T extends FieldValues> = Omit<
  SearchableSelectBaseProps,
  'name' | 'onBlur' | 'hasError'
> & {
  control: Control<T>
  name: Path<T>
}

type FormSingleProps<T extends FieldValues> = FormSearchableSelectBaseProps<T> & {
  multiple?: false
}

type FormMultiProps<T extends FieldValues> = FormSearchableSelectBaseProps<T> & {
  multiple: true
}

export type FormSearchableSelectProps<T extends FieldValues> =
  | FormSingleProps<T>
  | FormMultiProps<T>

export function FormSearchableSelect<T extends FieldValues>({
  control,
  name,
  multiple,
  ...rest
}: FormSearchableSelectProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) =>
        multiple ? (
          <SearchableSelect
            multiple
            name={field.name}
            value={field.value ?? []}
            onChange={field.onChange}
            onBlur={field.onBlur}
            hasError={!!fieldState.error}
            {...rest}
          />
        ) : (
          <SearchableSelect
            name={field.name}
            value={field.value ?? null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            hasError={!!fieldState.error}
            {...rest}
          />
        )
      }
    />
  )
}
