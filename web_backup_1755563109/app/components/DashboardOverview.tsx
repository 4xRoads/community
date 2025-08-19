import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, Clock, Users, AlertTriangle } from 'lucide-react'

export function DashboardOverview() {
  const widgets = [
    {
      title: 'Total Shifts This Week',
      value: '47',
      icon: Calendar,
      description: '+12% from last week',
      trend: 'up'
    },
    {
      title: 'Open Shifts',
      value: '8',
      icon: AlertTriangle,
      description: 'Need immediate coverage',
      trend: 'urgent'
    },
    {
      title: 'Active Drivers',
      value: '23',
      icon: Users,
      description: '18 available today',
      trend: 'neutral'
    },
    {
      title: 'Payroll Requests',
      value: '5',
      icon: Clock,
      description: 'Pending approval',
      trend: 'neutral'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {widgets.map((widget, index) => {
        const Icon = widget.icon
        return (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {widget.title}
              </CardTitle>
              <Icon className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold mb-1">{widget.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{widget.description}</p>
                {widget.trend === 'urgent' && (
                  <Badge variant="destructive" className="text-xs">Urgent</Badge>
                )}
                {widget.trend === 'up' && (
                  <Badge variant="secondary" className="text-xs">↑ 12%</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
