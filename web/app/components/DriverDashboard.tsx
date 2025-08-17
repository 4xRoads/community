import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Calendar, Clock, MapPin, DollarSign, AlertCircle } from 'lucide-react'

export function DriverDashboard() {
  const upcomingShifts = [
    {
      id: '1',
      route: 'Route A - Downtown',
      date: 'Today',
      startTime: '06:00',
      endTime: '14:00',
      vehicle: 'Bus #101',
      status: 'confirmed',
      estimatedPay: 120
    },
    {
      id: '2',
      route: 'Route B - Airport',
      date: 'Tomorrow',
      startTime: '14:00',
      endTime: '22:00',
      vehicle: 'Bus #102',
      status: 'pending',
      estimatedPay: 140
    },
    {
      id: '3',
      route: 'Route C - Mall',
      date: 'Jan 17',
      startTime: '08:00',
      endTime: '16:00',
      vehicle: 'Bus #103',
      status: 'scheduled',
      estimatedPay: 130
    }
  ]

  const notifications = [
    {
      id: '1',
      type: 'shift_change',
      message: 'Your shift on Route A has been moved to 7:00 AM',
      time: '2 hours ago',
      urgent: true
    },
    {
      id: '2',
      type: 'swap_request',
      message: 'Sarah Wilson requested to swap shifts on Jan 18',
      time: '4 hours ago',
      urgent: false
    },
    {
      id: '3',
      type: 'payout',
      message: 'Your payout request has been approved',
      time: '1 day ago',
      urgent: false
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h1 className="text-2xl font-semibold mb-2">Welcome back, John!</h1>
        <p className="text-muted-foreground">You have 3 upcoming shifts this week.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Shifts */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Upcoming Shifts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingShifts.map((shift) => (
                <div key={shift.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium">{shift.route}</h4>
                      <Badge className={`text-xs ${getStatusColor(shift.status)}`}>
                        {shift.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{shift.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{shift.startTime} - {shift.endTime}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{shift.vehicle}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 mt-2 text-sm">
                      <DollarSign className="w-3 h-3 text-green-600" />
                      <span className="text-green-600 font-medium">${shift.estimatedPay}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    {shift.status === 'pending' && (
                      <Button size="sm">Confirm</Button>
                    )}
                    <Button variant="outline" size="sm">Details</Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-center pt-4">
                <Button variant="outline">View All Shifts</Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                  <AlertCircle className="w-6 h-6" />
                  <span>Mark Not Available</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                  <Calendar className="w-6 h-6" />
                  <span>Request Swap</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center space-y-2 h-auto py-4">
                  <DollarSign className="w-6 h-6" />
                  <span>Request Payout</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Notifications</span>
                <Badge variant="secondary">{notifications.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-3 rounded-lg border ${notification.urgent ? 'bg-red-50 border-red-200' : 'bg-muted/50'}`}
                >
                  <p className="text-sm mb-1">{notification.message}</p>
                  <p className="text-xs text-muted-foreground">{notification.time}</p>
                  {notification.urgent && (
                    <Badge variant="destructive" className="text-xs mt-2">Urgent</Badge>
                  )}
                </div>
              ))}
              
              <Button variant="outline" className="w-full" size="sm">
                View All Notifications
              </Button>
            </CardContent>
          </Card>

          {/* Earnings Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>This Week</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hours Worked</span>
                  <span className="font-medium">32h</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Earnings</span>
                  <span className="font-medium">$640</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Available for Payout</span>
                  <span className="font-medium text-green-600">$480</span>
                </div>
                <Button className="w-full" size="sm">
                  Request Payout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
