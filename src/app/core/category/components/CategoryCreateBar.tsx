import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusCircleIcon, XIcon } from '@phosphor-icons/react'
import { Input } from '@/app/components/ui/input'
import Card from '@/app/shared/ui/Card'

const categoryCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
})

type CategoryCreateData = z.infer<typeof categoryCreateSchema>

interface CategoryCreateBarProps {
  onSubmit: (name: string) => void
}

export function CategoryCreateBar({ onSubmit }: CategoryCreateBarProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryCreateData>({
    resolver: zodResolver(categoryCreateSchema),
    defaultValues: { name: '' },
  })

  const onValid = (data: CategoryCreateData) => {
    onSubmit(data.name)
    reset()
  }

  return (
    <Card>
      <form
        onSubmit={handleSubmit(onValid)}
        className="flex h-9 items-center gap-4 rounded-2xl bg-white p-4"
      >
        <div className="flex flex-1 flex-col gap-1">
          <Input
            placeholder="Introducir nombre de categoría..."
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <span className="text-sm text-error-text">{errors.name && errors.name.message}</span>
        </div>
        <button
          type="submit"
          className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[10px] bg-blue-200 text-white"
        >
          <PlusCircleIcon />
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="shrink-0 cursor-pointer text-neutral-600 hover:text-neutral-350"
        >
          <XIcon />
        </button>
      </form>
    </Card>
  )
}
