import { NavLink } from 'react-router-dom'
import {
  ChartBar,
  Package,
  Users,
  FileText,
  Sidebar as SidebarCloseIcon,
  SidebarSimple as SidebarOpenIcon,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import { Button } from '@/app/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/app/components/ui/tooltip'

const navItems = [
  { to: '/backoffice', label: 'Dashboard', icon: ChartBar, end: true },
  { to: '/backoffice/orders', label: 'Pedidos', icon: Package },
  { to: '/backoffice/customers', label: 'Clientes', icon: Users },
  { to: '/backoffice/quotes', label: 'Presupuestos', icon: FileText },
]

export default function BackofficeSidebar() {
  const { isCollapsed, toggle } = useSidebarStore()

  return (
    <aside
      className={cn(
        'bg-muted/40 hidden flex-col border-r transition-all duration-300 md:flex',
        isCollapsed ? 'w-16' : 'w-64',
      )}
    >
      <div className={cn('flex p-2', isCollapsed ? 'justify-center' : 'justify-end')}>
        <Button variant="ghost" size="icon" onClick={toggle}>
          {isCollapsed ? (
            <SidebarOpenIcon className="h-5 w-5" />
          ) : (
            <SidebarCloseIcon className="h-5 w-5" />
          )}
        </Button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        <TooltipProvider delayDuration={0}>
          {navItems.map((item) => (
            <Tooltip key={item.to}>
              <TooltipTrigger asChild>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                      isCollapsed && 'justify-center px-2',
                    )
                  }
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </NavLink>
              </TooltipTrigger>
              {isCollapsed && <TooltipContent side="right">{item.label}</TooltipContent>}
            </Tooltip>
          ))}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
