import { NavLink } from 'react-router-dom'
import {
  House,
  Package,
  SquaresFour,
  Tag,
  Users,
  Handshake,
  ClipboardText,
  FileText,
  NewspaperClipping,
  Bell,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet'

const navItems = [
  { to: '/', label: 'Inicio', icon: House, end: true },
  { to: '/orders', label: 'Pedidos', icon: Package },
  { to: '/categories', label: 'Categorías', icon: SquaresFour },
  { to: '/products', label: 'Productos', icon: Tag },
  { to: '/clients', label: 'Clientes', icon: Users },
  { to: '/providers', label: 'Proveedores', icon: Handshake },
  { to: '/protocols', label: 'Protocolos', icon: ClipboardText },
  { to: '/quotes', label: 'Presupuestos', icon: FileText },
  { to: '/invoices', label: 'Facturas', icon: NewspaperClipping },
  { to: '/notifications', label: 'Notificaciones', icon: Bell },
]

export default function MobileSidebar() {
  const { isMobileOpen, setMobileOpen } = useSidebarStore()

  return (
    <Sheet open={isMobileOpen} onOpenChange={setMobileOpen}>
      <SheetContent side="left" className="w-64 bg-[#004f8b] p-0">
        <SheetHeader className="border-b border-white/20 p-4">
          <SheetTitle className="text-white">ProRetoque</SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white hover:bg-white/10',
                )
              }
            >
              <item.icon className="size-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
