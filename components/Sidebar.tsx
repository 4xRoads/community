import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  Route, 
  Calendar,
  CalendarDays,
  ChevronRight,
  ChevronDown
} from 'lucide-react'

interface SidebarProps {
  activeView: string
  onViewChange: (view: string) => void
  notificationCount?: number
}

export function Sidebar({ activeView, onViewChange, notificationCount = 0 }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      comingSoon: true
    },
    {
      id: 'crm',
      label: 'CRM',
      icon: Users,
      badge: null,
      comingSoon: true
    },
    {
      id: 'customer-requests',
      label: 'Customer Requests',
      icon: MessageSquare,
      badge: notificationCount > 0 ? notificationCount : null,
      comingSoon: false
    },
    {
      id: 'route-planning',
      label: 'Route Planning',
      icon: Route,
      badge: null,
      comingSoon: true
    },
    {
      id: 'driver-schedule',
      label: 'Driver Schedule',
      icon: Calendar,
      badge: null,
      comingSoon: false
    },
    {
      id: 'company-calendar',
      label: 'Company Calendar',
      icon: CalendarDays,
      badge: null,
      comingSoon: true
    }
  ]

  return (
    <div className={`bg-surface-1 border-r border-border-soft h-screen transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border-soft">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h2 className="font-semibold text-lg">Navigation</h2>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "secondary" : "ghost"}
              className={`w-full justify-start relative ${
                isCollapsed ? 'px-2' : 'px-3'
              } ${item.comingSoon ? 'opacity-60' : ''}`}
              onClick={() => onViewChange(item.id)}
            >
              <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'}`} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.comingSoon && (
                    <Badge variant="outline" className="text-xs ml-2 bg-muted text-muted-foreground border-muted-foreground/20">
                      Soon
                    </Badge>
                  )}
                  {item.badge && !item.comingSoon && (
                    <Badge variant="destructive" className="text-xs ml-2">
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
              {isCollapsed && item.badge && !item.comingSoon && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
                >
                  {item.badge}
                </Badge>
              )}
            </Button>
          )
        })}
      </nav>
    </div>
  )
}