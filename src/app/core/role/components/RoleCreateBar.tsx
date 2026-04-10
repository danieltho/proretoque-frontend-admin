import { useState } from 'react'
import { PlusCircleIcon, XIcon } from '@phosphor-icons/react'
import { Input } from '@/app/components/ui/input'
import { SearchableSelect, type SearchableSelectOption } from '@/app/components/ui/searchable-select'
import { FormFieldCard } from '@/app/shared/ui/forms/FormFieldCard'
import Card from '@/app/shared/ui/Card'

interface RoleCreateBarProps {
  accessOptions: SearchableSelectOption[]
  onSubmit: (name: string, accessIds: number[]) => void
}

export function RoleCreateBar({ accessOptions, onSubmit }: RoleCreateBarProps) {
  const [name, setName] = useState('')
  const [selectedAccess, setSelectedAccess] = useState<number[]>([])

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed, selectedAccess)
    setName('')
    setSelectedAccess([])
  }

  return (
    <Card>
      <div className="flex items-end gap-4">
        <FormFieldCard label="Nombre" className="flex-1">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Introducir nombre del role..."
          />
        </FormFieldCard>

        <FormFieldCard label="Acceso" className="flex-1">
          <SearchableSelect
            multiple
            options={accessOptions}
            value={selectedAccess}
            onChange={(ids) => setSelectedAccess(ids as number[])}
            placeholder="Seleccione los accesos..."
          />
        </FormFieldCard>

        <button
          type="button"
          onClick={handleSubmit}
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-blue-200 text-white"
        >
          <PlusCircleIcon className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            setName('')
            setSelectedAccess([])
          }}
          className="shrink-0 cursor-pointer text-neutral-600 hover:text-neutral-350"
        >
          <XIcon className="size-5" />
        </button>
      </div>
    </Card>
  )
}
