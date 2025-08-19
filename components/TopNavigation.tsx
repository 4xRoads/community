import { Bell, Calendar, Car, CreditCard, Route, Settings, Users } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'

interface TopNavigationProps {
  activeView: string
  onViewChange: (view: string) => void
  userRole: 'admin' | 'driver'
  notificationCount?: number
}

export function TopNavigation({ activeView, onViewChange, userRole, notificationCount = 0 }: TopNavigationProps) {
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'routes', label: 'Routes', icon: Route },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const driverNavItems = [
    { id: 'dashboard', label: 'My Schedule', icon: Calendar },
    { id: 'payroll', label: 'Payroll', icon: CreditCard },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  const navItems = userRole === 'admin' ? adminNavItems : driverNavItems

  return (
    <header className="bg-card border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold">DriverSchedule</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.id}
                  variant={activeView === item.id ? "secondary" : "ghost"}
                  className="flex items-center space-x-2"
                  onClick={() => onViewChange(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative"
            onClick={() => onViewChange('notifications')}
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                {notificationCount}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium">
                {userRole === 'admin' ? 'Admin User' : 'Driver'}
              </p>
              <p className="text-xs text-muted-foreground capitalize">{userRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}