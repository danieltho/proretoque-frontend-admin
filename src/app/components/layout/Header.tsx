import { useNavigate } from 'react-router-dom'
import { UserIcon, SignOutIcon, ListIcon } from '@phosphor-icons/react'
import { useAuthStore, isCustomerUser, isAdminUser } from '@/app/stores/authStore'
import { useSidebarStore } from '@/app/stores/sidebarStore'
import { logout as logoutService } from '@/app/shared/services/authService'
import { Button } from '@/app/components/ui/button'
import UploadNotifications from '@/app/components/shared/UploadNotifications'
import { NotificationBell } from '@/app/core/notification/component/NotificationBell'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu'

export default function Header() {
  const user = useAuthStore((s) => s.user)
  const { setMobileOpen } = useSidebarStore()
  const navigate = useNavigate()

  const displayName = isCustomerUser(user)
    ? `${user.firstname} ${user.lastname}`
    : isAdminUser(user)
      ? user.name
      : ''

  const handleLogout = async () => {
    try {
      await logoutService()
    } catch {
      // Si falla el logout en el server, store ya se limpió
    }
    navigate('/login')
  }

  return (
    <header className="flex h-18 items-center justify-between border-b border-neutral-400 bg-white px-6 leading-none">
      {/* Mobile Menu + Logo */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileOpen(true)}
        >
          <ListIcon />
        </Button>
        <h1 className="font-raleway text-[20px] leading-none font-bold text-black">ProRetoque</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <NotificationBell />
        <UploadNotifications />

        {/* Usuario + Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex cursor-pointer items-center gap-2.5">
              <span className="font-semibold  leading-none text-black">{displayName}</span>
              <UserIcon />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => navigate('/profiles')}>
              <UserIcon />
              Mi perfil
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <SignOutIcon />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
