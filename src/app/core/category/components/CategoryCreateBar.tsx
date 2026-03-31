import { useState } from 'react'
import { PlusCircleIcon, XIcon } from '@phosphor-icons/react'

interface CategoryCreateBarProps {
  onSubmit: (name: string) => void
}

export function CategoryCreateBar({ onSubmit }: CategoryCreateBarProps) {
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setName('')
  }

  return (
    <div className="flex h-9 items-center gap-4 rounded-2xl bg-white p-4">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        placeholder="Introducir nombre de categoría..."
        className="flex-1 bg-background px-3 py-1 text-base shadow-xs placeholder:text-muted-foreground focus:outline-none"
      />
      <button
        type="button"
        onClick={handleSubmit}
        className="flex size-9 items-center justify-center rounded-[10px] bg-blue-200 text-white"
      >
        <PlusCircleIcon className="size-6" />
      </button>
      <button
        type="button"
        onClick={() => setName('')}
        className="text-neutral-600 hover:text-neutral-350"
      >
        <XIcon className="size-6" />
      </button>
    </div>
  )
}
