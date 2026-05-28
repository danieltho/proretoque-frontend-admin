import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  SquaresFourIcon,
  TagIcon,
  UserGearIcon,
  SidebarSimpleIcon,
} from '@phosphor-icons/react'
import { cn } from '@/app/shared/utils/utils'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import { useAuthStore, isAdminUser } from '@/app/stores/authStore'
import type { RoleAccess } from '@/app/stores/authStore'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/app/components/ui/tooltip'

type NavItem = {
  to: string
  labelKey: string
  icon: React.ComponentType<{ className?: string }>
  end?: boolean
  access: RoleAccess
}

const navItems: NavItem[] = [
  { to: '/categories', labelKey: 'nav.categories', icon: SquaresFourIcon, access: 'PRODUCT' },
  { to: '/products', labelKey: 'nav.products', icon: TagIcon, access: 'PRODUCT' },
  { to: '/roles', labelKey: 'nav.roles', icon: UserGearIcon, access: 'ROLE' },
]

export default function Sidebar() {
  const { t } = useTranslation()
  const { isCollapsed, toggle } = useSidebarStore()
  const { pathname } = useLocation()
  const user = useAuthStore((s) => s.user)
  const accesses = isAdminUser(user) ? (user.role?.accesses ?? []) : []
  const visibleItems = navItems.filter((item) => accesses.includes(item.access))

  return (
    <aside
      className={cn(
        'hidden flex-col items-center gap-6 bg-blue-200 py-6 transition-all duration-200 md:flex',
        isCollapsed ? 'w-18 px-4' : 'items-end w-52 px-4',
      )}
    >
      <button
        type="button"
        aria-label={isCollapsed ? 'Expandir barra lateral' : 'Replegar barra lateral'}
        onClick={toggle}
        className="cursor-pointer"
      >
        <SidebarSimpleIcon className="shrink-0 text-white" />
      </button>

      <nav className={cn('flex flex-1 flex-col gap-4', isCollapsed ? 'items-center' : 'w-full')}>
        <TooltipProvider delayDuration={0}>
          {visibleItems.map((item) => {
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
                      <span className="text-sm font-medium text-white">{t(item.labelKey)}</span>
                    )}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{t(item.labelKey)}</TooltipContent>}
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </nav>
    </aside>
  )
}
