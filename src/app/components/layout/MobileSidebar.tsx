import { NavLink } from 'react-router-dom'
import {
  House,
  Package,
  ClipboardText,
  FileText,
  NewspaperClipping,
  ChatText,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/app/components/ui/sheet'

const navItems = [
  { to: '/home', label: 'Inicio', icon: House },
  { to: '/orders', label: 'Pedidos', icon: Package },
  { to: '/protocols', label: 'Protocolos', icon: ClipboardText },
  { to: '/quotes', label: 'Presupuestos', icon: FileText },
  { to: '/invoices', label: 'Facturas', icon: NewspaperClipping },
  { to: '/chat', label: 'Chat', icon: ChatText },
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
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white',
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
