import { NavLink } from 'react-router-dom'
import {
  HouseIcon,
  FileTextIcon,
  NewspaperClippingIcon,
  ChatTextIcon,
  PackageIcon,
  ClipboardTextIcon,
  SquaresFourIcon,
  UsersIcon,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'

const navItems = [
  { to: '/', label: 'Inicio', icon: HouseIcon },
  { to: '/clients', label: 'Clientes', icon: UsersIcon },
  { to: '/orders', label: 'Pedidos', icon: PackageIcon },
  { to: '/protocols', label: 'Protocolos', icon: ClipboardTextIcon },
  { to: '/quotes', label: 'Presupuestos', icon: FileTextIcon },
  /* { to: '/invoices', label: 'Facturas', icon: NewspaperClippingIcon }, */
]

export default function Sidebar() {
  return (
    <aside className="hidden w-18 flex-col items-center gap-6 bg-blue-200 px-4 py-6 md:flex">
      {/* Brand icon */}
      <SquaresFourIcon className="size-6 shrink-0 text-white" />

      {/* Navigation */}
      <nav className="flex flex-1 flex-col items-center gap-6">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center justify-center rounded-lg p-2 transition-colors',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white',
                    )
                  }
                >
                  <item.icon className="size-6 shrink-0" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="right">{item.label}</TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
