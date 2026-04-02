import { useState } from 'react'
import { useOrderForm } from '../context/OrderFormContext'
import { Card } from '@/app/components/ui/card'
import { Checkbox } from '@/app/components/ui/checkbox'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/app/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/app/components/ui/command'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/app/components/ui/sheet'
import { CaretUpDownIcon, CheckIcon } from '@phosphor-icons/react'
import { DELIVERY_TIMES } from '../../types/batch'
import type { DeliveryOptions } from '../../types/batch'

export default function StepResumen() {
  const {
    batches,
    activeBatchId,
    setActiveBatchId,
    activeBatch,
    updateDeliveryOptions,
    applyDeliveryToAll,
  } = useOrderForm()

  const [applyAll, setApplyAll] = useState(false)
  const [batchSelectorOpen, setBatchSelectorOpen] = useState(false)
  const [chatBatchOpen, setChatBatchOpen] = useState(false)

  if (!activeBatch) return null

  const options = activeBatch.deliveryOptions

  const updateOption = <K extends keyof DeliveryOptions>(key: K, value: DeliveryOptions[K]) => {
    updateDeliveryOptions(activeBatchId, { [key]: value })
    if (applyAll) {
      applyDeliveryToAll({ ...options, [key]: value })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
      {/* Columna izquierda: Selector lote + Tiempo de entrega */}
      <div className="w-64 shrink-0 space-y-4 overflow-y-auto">
        {/* Selector de lote */}
        <Card className="space-y-3 p-4">
          <Popover
            open={batchSelectorOpen && !applyAll}
            onOpenChange={(o) => !applyAll && setBatchSelectorOpen(o)}
          >
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                disabled={applyAll}
                className="w-full justify-between font-normal"
              >
                <span className="truncate">
                  {activeBatch
                    ? `${batches.indexOf(activeBatch) + 1}. ${activeBatch.name}`
                    : 'Seleccionar lote'}
                </span>
                <CaretUpDownIcon size={16} className="ml-2 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar lote..." />
                <CommandList>
                  <CommandEmpty>Sin resultados.</CommandEmpty>
                  <CommandGroup>
                    {batches.map((batch, i) => (
                      <CommandItem
                        key={batch.id}
                        value={`${i + 1}. ${batch.name}`}
                        onSelect={() => {
                          setActiveBatchId(batch.id)
                          setBatchSelectorOpen(false)
                        }}
                      >
                        <CheckIcon
                          size={16}
                          className={`mr-2 shrink-0 ${activeBatchId === batch.id ? 'opacity-100' : 'opacity-0'}`}
                        />
                        {i + 1}. {batch.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <label className="flex items-center gap-2 text-sm">
            <Checkbox
              checked={applyAll}
              onCheckedChange={(checked) => setApplyAll(checked === true)}
            />
            Aplicar a todos los lotes
          </label>
        </Card>

        {/* Tiempo de entrega */}
        <Card className="overflow-hidden p-0">
          <div className="bg-foreground text-background grid grid-cols-2 text-center text-xs font-bold">
            <div className="border-background/20 border-r p-2">TIEMPO DE ENTREGA</div>
            <div className="p-2">RECARGOS</div>
          </div>
          {DELIVERY_TIMES.map((dt) => (
            <button
              key={dt.value}
              type="button"
              onClick={() => updateOption('deliveryTime', dt.value)}
              className={`grid w-full grid-cols-2 border-b text-sm transition-colors last:border-b-0 ${
                options.deliveryTime === dt.value
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'hover:bg-accent'
              }`}
            >
              <div className="border-r p-2.5">{dt.label}</div>
              <div className="p-2.5">{dt.surcharge}</div>
            </button>
          ))}
        </Card>
      </div>

      {/* Columna centro: Opciones de entrega */}
      <div className="flex-1 overflow-y-auto">
        <Card className="space-y-5 p-6">
          <h3 className="text-primary text-center text-sm font-bold tracking-wide uppercase">
            OPCIONES DE ENTREGA
          </h3>

          <div className="space-y-4">
            {/* Formato */}
            <div className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium">Formato</span>
              <Select value={options.format} onValueChange={(v) => updateOption('format', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PSD">PSD</SelectItem>
                  <SelectItem value="TIFF">TIFF</SelectItem>
                  <SelectItem value="JPG">JPG</SelectItem>
                  <SelectItem value="PNG">PNG</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Incrustar perfil */}
            <div className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium">Incrustar perfil</span>
              <Select
                value={options.embedProfile}
                onValueChange={(v) => updateOption('embedProfile', v)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="No cambiar">No cambiar</SelectItem>
                  <SelectItem value="Adobe RGB 1998">Adobe RGB 1998</SelectItem>
                  <SelectItem value="sRGB IEC61966-2.1">sRGB IEC61966-2.1</SelectItem>
                  <SelectItem value="Gray Gamma 2.2">Gray Gamma 2.2</SelectItem>
                  <SelectItem value="Gray Gamma 1.8">Gray Gamma 1.8</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Mapa de bits */}
            <div className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium">Mapa de bits</span>
              <Select value={options.bitDepth} onValueChange={(v) => updateOption('bitDepth', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8 bits">8 bits</SelectItem>
                  <SelectItem value="16 bits">16 bits</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Modo Color */}
            <div className="flex items-center gap-3">
              <span className="w-40 text-sm font-medium">Modo Color</span>
              <Select value={options.colorMode} onValueChange={(v) => updateOption('colorMode', v)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RGB">RGB</SelectItem>
                  <SelectItem value="CMYK">CMYK</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={options.preserveMask}
                onCheckedChange={(c) => updateOption('preserveMask', c === true)}
              />
              Conservar máscara de capas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={options.preserveLayers}
                onCheckedChange={(c) => updateOption('preserveLayers', c === true)}
              />
              Preservar archivo en capas
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={options.preserveOriginalLayer}
                onCheckedChange={(c) => updateOption('preserveOriginalLayer', c === true)}
              />
              Preservar capa original
            </label>
          </div>

          {/* Dimensión */}
          <div className="flex items-center gap-3">
            <span className="w-40 text-sm font-medium">Dimensión</span>
            <div className="flex flex-1 items-center gap-2">
              <Input
                placeholder="Ancho"
                value={options.dimension?.width ?? ''}
                onChange={(e) =>
                  updateOption('dimension', {
                    width: e.target.value,
                    height: options.dimension?.height ?? '',
                  })
                }
              />
              <span className="text-muted-foreground text-sm">x</span>
              <Input
                placeholder="Alto"
                value={options.dimension?.height ?? ''}
                onChange={(e) =>
                  updateOption('dimension', {
                    width: options.dimension?.width ?? '',
                    height: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Resolución */}
          <div className="flex items-center gap-3">
            <span className="w-40 text-sm font-medium">Resolución</span>
            <Input
              className="flex-1"
              placeholder="ej. 300"
              value={options.resolution}
              onChange={(e) => updateOption('resolution', e.target.value)}
            />
          </div>
        </Card>
      </div>

      {/* Sheets (sidebars) */}
      <Sheet open={chatBatchOpen} onOpenChange={setChatBatchOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Chat</SheetTitle>
            <SheetDescription>Próximamente</SheetDescription>
          </SheetHeader>
          <div className="text-muted-foreground flex flex-1 items-center justify-center text-sm">
            <p>Esta funcionalidad estará disponible próximamente.</p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
