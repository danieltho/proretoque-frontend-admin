import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DetailsTable, type DetailRow } from '@/shared/ui/DetailsTable'

export interface GroupedItem {
  id: string | number
  label: string
  value: string
}

export interface CategoryGroup {
  name: string
  items: GroupedItem[]
}

export interface CardDetailsSection {
  title?: string
  subtitle?: string
  rows?: DetailRow[]
  groups?: CategoryGroup[]
}

interface CardDetailsProps {
  sections: CardDetailsSection[]
  className?: string
}

export function CardDetails({ sections, className }: CardDetailsProps) {
  return (
    <Card className={cn('sticky flex shrink-0 flex-col gap-4 p-6 rounded-[20px]', className)}>
      {sections.map((section, index) => (
        <div key={index} className="flex flex-col gap-4">
          {index > 0 && <Separator />}

          {section.title && (
            <div className="flex flex-col gap-1">
              <h3 className="text-[22px] font-medium leading-[26.4px]">{section.title}</h3>
              {section.subtitle && <p className="text-sm font-normal">{section.subtitle}</p>}
            </div>
          )}

          {section.rows && <DetailsTable rows={section.rows} />}

          {section.groups && section.groups.length > 0 && (
            <div className="flex max-h-44 flex-col gap-1 overflow-y-auto">
              {section.groups.map((group) => (
                <div key={group.name} className="flex flex-col gap-0.5">
                  <span className="text-sm font-normal">{group.name}</span>
                  {group.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-base">
                      <span className="font-medium">{item.label}</span>
                      <span className="font-normal">{item.value}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </Card>
  )
}
