import { useState, useMemo, useEffect } from 'react'
import { MagnifyingGlass, Trash, Check } from '@phosphor-icons/react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/ui/dialog'

export interface Protocol {
  id: number
  name: string
  category: string
  product_items: Array<{ id: number; name: string; product: { id: number; name: string } }>
}

// TODO: reemplazar con llamada a API GET /protocols
const MOCK_PROTOCOLS: Protocol[] = [
  { id: 1, name: 'Retoque de piel básico', category: 'Piel /', product_items: [] },
  { id: 2, name: 'Retoque de piel avanzado', category: 'Piel /', product_items: [] },
  { id: 3, name: 'Eliminación de manchas', category: 'Piel /', product_items: [] },
  { id: 4, name: 'Corrección de color global', category: 'Color /', product_items: [] },
  { id: 5, name: 'Corrección selectiva de color', category: 'Color /', product_items: [] },
  { id: 6, name: 'Blanco y negro artístico', category: 'Color /', product_items: [] },
  { id: 7, name: 'Recorte de fondo', category: 'Fondo /', product_items: [] },
  { id: 8, name: 'Fondo blanco puro', category: 'Fondo /', product_items: [] },
  { id: 9, name: 'Cambio de fondo', category: 'Fondo /', product_items: [] },
  { id: 10, name: 'Reducción de ruido', category: 'Calidad /', product_items: [] },
  { id: 11, name: 'Nitidez selectiva', category: 'Calidad /', product_items: [] },
  { id: 12, name: 'Corrección de exposición', category: 'Iluminación /', product_items: [] },
  { id: 13, name: 'Dodge & Burn', category: 'Iluminación /', product_items: [] },
  { id: 14, name: 'Recorte de objeto', category: 'Mascaras /', product_items: [] },
  { id: 15, name: 'Máscara de cabello', category: 'Mascaras /', product_items: [] },
]

interface Props {
  open: boolean
  onClose: () => void
  onSave: (protocols: Protocol[]) => void
  initialSelected?: Protocol[]
}

export default function ProtocolSelectorDialog({
  open,
  onClose,
  onSave,
  initialSelected = [],
}: Props) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Protocol[]>(initialSelected)

  useEffect(() => {
    if (open) {
      setSelected(initialSelected)
      setSearch('')
    }
  }, [open])

  const filtered = useMemo(
    () =>
      MOCK_PROTOCOLS.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.category.toLowerCase().includes(search.toLowerCase()),
      ),
    [search],
  )

  const isSelected = (id: number) => selected.some((p) => p.id === id)

  const toggle = (protocol: Protocol) => {
    setSelected((prev) =>
      isSelected(protocol.id) ? prev.filter((p) => p.id !== protocol.id) : [...prev, protocol],
    )
  }

  const remove = (id: number) => {
    setSelected((prev) => prev.filter((p) => p.id !== id))
  }

  const handleSave = () => {
    onSave(selected)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex h-[85vh] flex-col gap-4 sm:max-w-[90vw]">
        <DialogHeader>
          <DialogTitle>Protocolos</DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 gap-2">
          {/* Columna izquierda: buscador + listado */}
          <Card className="flex min-h-0 min-w-0 flex-1 flex-col gap-0 py-0">
            <CardHeader className="gap-3 px-5 pt-5 pb-3">
              <div className="relative">
                <MagnifyingGlass className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                <Input
                  placeholder="Buscar"
                  className="pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <p className="text-muted-foreground text-sm">{filtered.length} resultados</p>
            </CardHeader>

            <CardContent className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              <div className="space-y-0.5">
                {filtered.map((protocol) => (
                  <div
                    key={protocol.id}
                    className="flex items-center justify-between border-b py-3 last:border-b-0"
                  >
                    <div>
                      <p className="text-sm font-medium">{protocol.name}</p>
                      <p className="text-muted-foreground text-xs">{protocol.category}</p>
                    </div>

                    {isSelected(protocol.id) ? (
                      <button
                        type="button"
                        onClick={() => toggle(protocol)}
                        className="text-primary flex items-center gap-1.5 text-sm font-medium"
                      >
                        <Check className="h-4 w-4" />
                        Agregado
                      </button>
                    ) : (
                      <Button size="sm" onClick={() => toggle(protocol)}>
                        Agregar
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Columna derecha: protocolos incluidos */}
          <Card className="flex w-72 shrink-0 flex-col gap-0 py-0">
            <CardHeader className="px-5 pt-5 pb-3">
              <CardTitle className="text-sm">Protocolos seleccionados</CardTitle>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
              {selected.length === 0 ? (
                <p className="text-muted-foreground text-xs">Ningún protocolo seleccionado.</p>
              ) : (
                <div className="space-y-3">
                  {selected.map((protocol) => (
                    <div key={protocol.id} className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{protocol.name}</p>
                        <p className="text-muted-foreground text-xs">{protocol.category}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive h-6 w-6 shrink-0"
                        onClick={() => remove(protocol.id)}
                      >
                        <Trash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
