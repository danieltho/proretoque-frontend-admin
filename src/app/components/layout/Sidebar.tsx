import { Link, useLocation } from 'react-router-dom'
import {
  HouseIcon,
  PackageIcon,
  SquaresFourIcon,
  TagIcon,
  UsersIcon,
  UserGearIcon,
  HandshakeIcon,
  ClipboardTextIcon,
  FileTextIcon,
  SidebarSimpleIcon,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip'

const navItems = [
  { to: '/', label: 'Inicio', icon: HouseIcon, end: true },
  { to: '/orders', label: 'Pedidos', icon: PackageIcon },
  { to: '/categories', label: 'Categorías', icon: SquaresFourIcon },
  { to: '/products', label: 'Productos', icon: TagIcon },
  { to: '/clients', label: 'Clientes', icon: UsersIcon },
  { to: '/roles', label: 'Roles', icon: UserGearIcon },
  { to: '/users', label: 'Usuarios', icon: UserGearIcon },
  { to: '/providers', label: 'Proveedores', icon: HandshakeIcon },
  { to: '/protocols', label: 'Protocolos', icon: ClipboardTextIcon },
  { to: '/quotes', label: 'Presupuestos', icon: FileTextIcon },
]

export default function Sidebar() {
  const { isCollapsed, toggle } = useSidebarStore()
  const { pathname } = useLocation()

  return (
    <aside
      className={cn(
        'hidden flex-col items-center gap-6 bg-blue-200 py-6 transition-all duration-200 md:flex',
        isCollapsed ? 'w-18 px-4' : 'items-end w-52 px-4',
      )}
    >
      <button type="button" onClick={toggle} className="cursor-pointer">
        <SidebarSimpleIcon className="shrink-0 text-white" />
      </button>

      <nav className={cn('flex flex-1 flex-col gap-4', isCollapsed ? 'items-center' : 'w-full')}>
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => {
            const isActive = item.end ? pathname === item.to : pathname.startsWith(item.to)

            return (
              <Tooltip key={item.to}>
                <TooltipTrigger asChild>
                  <Link
                    to={item.to}
                    className={cn(
                      'flex items-center rounded-lg p-2 transition-colors',
                      isCollapsed ? 'justify-center' : 'gap-3',
                      isActive ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10',
                    )}
                  >
                    <item.icon className="shrink-0 text-white" />
                    {!isCollapsed && (
                      <span className="text-sm font-medium text-white">{item.label}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
