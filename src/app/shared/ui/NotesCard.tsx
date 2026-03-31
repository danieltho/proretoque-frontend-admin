import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import { Label } from '@/app/components/ui/label'
import { Textarea } from '@/app/components/ui/textarea'
import { cn } from '@/app/shared/utils/utils'

export interface NotesCardProps {
  title?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
  disabled?: boolean
  id?: string
}

export default function NotesCard({
  title = 'Notas',
  placeholder = 'Escribe tus observaciones',
  value,
  onChange,
  className,
  disabled,
  id = 'notes',
}: NotesCardProps) {
  return (
    <Card className={cn('rounded-[20px] border-[#b4b3b3] shadow-none', className)}>
      <CardHeader>
        <CardTitle>
          <Label htmlFor={id} className="text-sm font-medium">
            {title}
          </Label>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col">
        <Textarea
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="flex-1 resize-y"
        />
      </CardContent>
    </Card>
  )
}
