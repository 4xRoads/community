import { useState, useEffect, useCallback } from 'react'
import { Header } from './components/Header'
import { Sidebar } from './components/Sidebar'
import { ComingSoonCard } from './components/ComingSoonCard'
import { TicketList, type Ticket } from './components/TicketList'
import { TicketCreationModal } from './components/TicketCreationModal'
import { TicketDetailView } from './components/TicketDetailView'
import { ScheduleBoard } from './components/ScheduleBoard'
import { DriverDashboard } from './components/DriverDashboard'
import { ShiftForm } from './components/ShiftForm'
import { AuthPage } from './components/AuthPage'
import { PromptConsole } from './components/PromptConsole'
import { AIHelpPanel } from './components/AIHelpPanel'
import { AIHelpButton } from './components/AIHelpButton'
import { DisambiguationDrawer } from './components/DisambiguationDrawer'
import { ConflictDrawer } from './components/ConflictDrawer'
import { CoverageSuggestionDrawer } from './components/CoverageSuggestionDrawer'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Toaster } from './components/ui/sonner'
import { 
  Bell, 
  Settings, 
  Users, 
  Car, 
  Route, 
  CreditCard, 
  Loader2,
  LayoutDashboard,
  MessageSquare
} from 'lucide-react'
import { useAuth } from './hooks/useAuth'
import { apiService, type Shift, type Driver, type PayoutRequest, type Notification } from './services/api'
import { toast } from 'sonner@2.0.3'

export default function App() {
  const [activeView, setActiveView] = useState('dashboard')
  const [showShiftModal, setShowShiftModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  
  // Shift editing state
  const [selectedShift, setSelectedShift] = useState<any>(null)
  const [isEditingShift, setIsEditingShift] = useState(false)
  
  // AI Panel States
  const [showAIHelp, setShowAIHelp] = useState(false)
  const [showDisambiguation, setShowDisambiguation] = useState(false)
  const [showConflicts, setShowConflicts] = useState(false)
  const [showCoverage, setShowCoverage] = useState(false)
  
  // AI Data States
  const [disambiguationData, setDisambiguationData] = useState<any[]>([])
  const [conflictData, setConflictData] = useState<any[]>([])
  const [coverageData, setCoverageData] = useState<any>({})
  
  // Existing state
  const [shifts, setShifts] = useState<Shift[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Enhanced tickets with AI context
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: 'TKT-001',
      customer: 'ABC Manufacturing',
      location: 'Building A, Floor 2',
      contact: '555-0123',
      category: 'Bin Drops',
      priority: 'High',
      dateRequested: '2024-01-15',
      expectedResolutionDate: '2024-01-16',
      status: 'New',
      description: 'Need additional bin drops for increased production waste',
      route: 'Route A-1',
      shift: 'Morning',
      driver: 'John Doe',
      vehicle: 'TRK-001'
    },
    {
      id: 'TKT-002',
      customer: 'City Mall',
      location: 'Food Court',
      contact: 'manager@citymall.com',
      category: 'Missed Service',
      priority: 'Critical',
      dateRequested: '2024-01-10',
      expectedResolutionDate: '2024-01-12',
      status: 'Triaged',
      description: 'Waste collection was missed yesterday, causing overflow issues',
      assignedTo: 'sarah.jones'
    },
    {
      id: 'TKT-003',
      customer: 'Green Valley Apartments',
      location: 'Unit 15B',
      contact: '555-0456',
      category: 'Bin Issue',
      priority: 'Medium',
      dateRequested: '2024-01-14',
      expectedResolutionDate: '2024-01-20',
      status: 'In Progress',
      description: 'Bin lid is damaged and needs replacement',
      assignedTo: 'john.smith'
    },
    {
      id: 'TKT-004',
      customer: 'ACME Market',
      location: '123 Main St',
      contact: '555-0789',
      category: 'Service Issue',
      priority: 'Medium',
      dateRequested: '2024-01-08',
      expectedResolutionDate: '2024-01-15',
      status: 'Closed',
      description: 'Request for additional service frequency',
      assignedTo: 'mike.wilson'
    }
  ])

  const { user, loading: authLoading, accessToken, signOut } = useAuth()

  // Load initial data when user is authenticated
  const loadInitialData = useCallback(async () => {
    if (!accessToken) return
    
    setIsLoading(true)
    try {
      // Load shifts
      const shiftsResult = await apiService.getShifts(accessToken)
      if (shiftsResult.success && shiftsResult.data) {
        setShifts(shiftsResult.data.shifts || [])
      } else {
        console.error('Failed to load shifts:', shiftsResult.error)
      }

      // Load drivers if admin
      if (user?.role === 'admin') {
        const driversResult = await apiService.getDrivers(accessToken)
        if (driversResult.success && driversResult.data) {
          setDrivers(driversResult.data.drivers || [])
        } else {
          console.error('Failed to load drivers:', driversResult.error)
        }

        const payoutsResult = await apiService.getPayoutRequests(accessToken)
        if (payoutsResult.success && payoutsResult.data) {
          setPayoutRequests(payoutsResult.data.payouts || [])
        } else {
          console.error('Failed to load payouts:', payoutsResult.error)
        }
      }

      // Load notifications
      if (user?.id) {
        const notificationsResult = await apiService.getNotifications(user.id, accessToken)
        if (notificationsResult.success && notificationsResult.data) {
          setNotifications(notificationsResult.data.notifications || [])
        } else {
          console.error('Failed to load notifications:', notificationsResult.error)
        }
      }
    } catch (error: any) {
      console.error('Error loading initial data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [user, accessToken])

  useEffect(() => {
    if (user && accessToken) {
      loadInitialData()
    }
  }, [user, accessToken, loadInitialData])

  // AI Action Handlers
  const handleExecuteAction = (intent: any) => {
    switch (intent.action) {
      case 'create_ticket':
        const newTicket: Ticket = {
          id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
          customer: intent.fields.customer || 'Unknown Customer',
          location: intent.fields.location || 'Not specified',
          contact: intent.fields.contact || '',
          category: intent.fields.category || 'General',
          priority: intent.fields.priority || 'Medium',
          dateRequested: intent.fields.dateRequested || new Date().toISOString().split('T')[0],
          expectedResolutionDate: intent.fields.expectedResolutionDate || '',
          status: 'New',
          description: intent.fields.description || '',
          route: intent.fields.route,
          shift: intent.fields.shift,
          driver: intent.fields.driver,
          vehicle: intent.fields.vehicle
        }
        setTickets(prev => [...prev, newTicket])
        toast.success(`Ticket ${newTicket.id} created successfully!`)
        setActiveView('customer-requests')
        break

      case 'schedule_shift':
        // Mock shift creation from AI
        const newShift = {
          id: `shift-${Date.now()}`,
          driver: intent.fields.driver || 'Unassigned',
          route: intent.fields.route || 'TBD',
          date: intent.fields.date || new Date().toISOString().split('T')[0],
          startTime: intent.fields.startTime || '09:00',
          endTime: intent.fields.endTime || '17:00',
          status: 'scheduled',
          vehicle: intent.fields.vehicle || 'TBD',
          backupDriver: intent.fields.backupDriver
        }
        toast.success(`Shift scheduled for ${newShift.driver} on ${newShift.route}`)
        setActiveView('driver-schedule')
        break

      case 'mark_unavailable':
        // Mock coverage suggestion trigger
        setCoverageData({
          unavailableDriver: intent.fields.driver || 'Unknown Driver',
          route: 'Route 4',
          shift: intent.fields.timeSlot || 'Morning Shift',
          candidates: [
            {
              id: 'driver-1',
              name: 'Sarah Johnson',
              score: 95,
              availability: 'available',
              distance: 2.1,
              routeFamiliarity: 85,
              currentHours: 32,
              maxHours: 40,
              license: ['CDL-B', 'Hazmat'],
              reasons: [
                { type: 'positive', text: 'High route familiarity' },
                { type: 'positive', text: 'Available immediately' },
                { type: 'positive', text: 'Lives close to route' }
              ],
              contact: { phone: '555-0123', email: 'sarah.j@company.com' },
              location: 'Downtown'
            },
            {
              id: 'driver-2',
              name: 'Mike Rodriguez',
              score: 78,
              availability: 'overtime',
              distance: 5.3,
              routeFamiliarity: 60,
              currentHours: 38,
              maxHours: 40,
              license: ['CDL-B'],
              reasons: [
                { type: 'positive', text: 'Reliable track record' },
                { type: 'warning', text: 'Would result in overtime' },
                { type: 'negative', text: 'Limited route experience' }
              ],
              contact: { phone: '555-0456', email: 'mike.r@company.com' },
              location: 'Westside'
            }
          ]
        })
        setShowCoverage(true)
        break

      default:
        toast.info('Action not implemented yet')
    }
  }

  const handleOpenDisambiguation = (matches: any[]) => {
    setDisambiguationData(matches)
    setShowDisambiguation(true)
  }

  const handleOpenConflicts = (conflicts: any[]) => {
    const formattedConflicts = conflicts.map(conflict => ({
      id: `conflict-${Date.now()}-${Math.random()}`,
      type: conflict.type,
      severity: conflict.type === 'double_booking' ? 'high' : 'medium',
      title: conflict.type === 'double_booking' ? 'Double Booking Detected' : 'Overtime Risk',
      description: conflict.type === 'double_booking' 
        ? `Driver is already scheduled for another shift`
        : `Driver would exceed weekly hour limits`,
      details: conflict,
      suggestions: conflict.type === 'double_booking' ? [
        {
          id: 'reassign',
          title: 'Reassign to backup driver',
          description: 'Use the designated backup driver for this shift',
          action: 'reassign'
        },
        {
          id: 'modify',
          title: 'Modify shift time',
          description: 'Adjust the shift time to avoid conflict',
          action: 'modify_time'
        }
      ] : [
        {
          id: 'approve',
          title: 'Approve overtime',
          description: 'Allow driver to work overtime hours',
          action: 'override'
        },
        {
          id: 'reassign',
          title: 'Find different driver',
          description: 'Assign this shift to another available driver',
          action: 'reassign'
        }
      ]
    }))
    setConflictData(formattedConflicts)
    setShowConflicts(true)
  }

  // Navigation handler for AI Help
  const handleAINavigation = (view: string, filters?: any) => {
    setActiveView(view)
    setShowAIHelp(false)
    
    if (filters?.showOverdueOnly) {
      // This would typically be handled by the TicketList component
      toast.info('Filtering to show overdue tickets only')
    }
  }

  // Existing handlers
  const handleCreateShift = () => {
    // Reset form data for creating new shift
    setSelectedShift(null)
    setIsEditingShift(false)
    setShowShiftModal(true)
  }

  const handleEditShift = (shiftData: any) => {
    console.log('handleEditShift called with:', shiftData)
    
    // Ensure we have a valid shift ID
    if (!shiftData.id) {
      console.error('Shift data is missing ID:', shiftData)
      toast.error('Cannot edit shift: missing ID')
      return
    }
    
    // Helper function to get driver name by ID
    const getDriverNameById = (driverId: string): string => {
      if (driverId === 'unassigned' || !driverId) return 'Unassigned'
      const driver = drivers.find(d => d.id === driverId)
      return driver?.name || driverId
    }
    
    // Set up editing mode - IMPORTANT: Include the ID and both driver_id and driver_name!
    setSelectedShift({
      id: shiftData.id, // This was missing and causing the 404 error
      driver: shiftData.driver || 'unassigned',
      driverName: shiftData.driverName || getDriverNameById(shiftData.driver),
      route: shiftData.route,
      date: shiftData.date,
      vehicle: shiftData.vehicle,
      start_time: shiftData.startTime || shiftData.start_time,
      end_time: shiftData.endTime || shiftData.end_time,
      status: shiftData.status,
      hours_worked: shiftData.hoursWorked || shiftData.hours_worked,
      backup_driver: shiftData.backupDriver || shiftData.backup_driver || 'none',
      backup_driver_name: shiftData.backup_driver_name || getDriverNameById(shiftData.backupDriver || shiftData.backup_driver) || 'None',
      qualification: shiftData.qualifications || shiftData.qualification || [],
      repeat: false,
      repeat_end_date: ''
    })
    setIsEditingShift(true)
    setShowShiftModal(true)
  }

  const handleShiftSubmit = async (shiftData: any) => {
    if (!accessToken) return

    try {
      if (isEditingShift && selectedShift) {
        console.log('Updating shift with ID:', selectedShift.id, 'and data:', shiftData)
        
        // Update existing shift
        const result = await apiService.updateShift(selectedShift.id, shiftData, accessToken)
        if (result.success && result.data) {
          toast.success('Shift updated successfully!')
          setShifts(prev => prev.map(shift => 
            shift.id === selectedShift.id ? result.data.shift : shift
          ))
        } else {
          console.error('Update shift error:', result.error)
          toast.error(result.error || 'Failed to update shift')
        }
      } else {
        console.log('Creating new shift with data:', shiftData)
        
        // Create new shift
        const result = await apiService.createShift(shiftData, accessToken)
        if (result.success && result.data) {
          toast.success('Shift created successfully!')
          setShifts(prev => [...prev, result.data.shift])
          
          if (shiftData.driver && shiftData.driver !== 'unassigned') {
            await apiService.sendNotification({
              recipient_id: shiftData.driver,
              title: 'New Shift Assigned',
              message: `You have been assigned to ${shiftData.route} on ${shiftData.date}`,
              type: 'shift_assignment'
            }, accessToken)
          }
        } else {
          console.error('Create shift error:', result.error)
          toast.error(result.error || 'Failed to create shift')
        }
      }
      
      // Reset editing state
      setSelectedShift(null)
      setIsEditingShift(false)
    } catch (error: any) {
      console.error('Error with shift operation:', error)
      toast.error(isEditingShift ? 'Failed to update shift' : 'Failed to create shift')
    }
  }

  const handleShiftUpdate = async (shiftId: string, updateData: any) => {
    if (!accessToken) return

    try {
      const result = await apiService.updateShift(shiftId, updateData, accessToken)
      if (result.success && result.data) {
        toast.success('Shift updated successfully!')
        setShifts(prev => prev.map(shift => 
          shift.id === shiftId ? result.data.shift : shift
        ))
      } else {
        toast.error(result.error || 'Failed to update shift')
      }
    } catch (error: any) {
      console.error('Error updating shift:', error)
      toast.error('Failed to update shift')
    }
  }

  const handleShiftDelete = async (shiftId: string) => {
    if (!accessToken) return

    try {
      const result = await apiService.deleteShift(shiftId, accessToken)
      if (result.success) {
        toast.success('Shift deleted successfully!')
        setShifts(prev => prev.filter(shift => shift.id !== shiftId))
      } else {
        toast.error(result.error || 'Failed to delete shift')
      }
    } catch (error: any) {
      console.error('Error deleting shift:', error)
      toast.error('Failed to delete shift')
    }
  }

  const handlePayoutRequest = async (amount: number, hours: number) => {
    if (!accessToken) return

    try {
      const result = await apiService.requestPayout({ amount, hours }, accessToken)
      if (result.success) {
        toast.success('Payout requested successfully!')
        if (user?.role === 'driver') {
          loadInitialData()
        }
      } else {
        toast.error(result.error || 'Failed to request payout')
      }
    } catch (error: any) {
      console.error('Error requesting payout:', error)
      toast.error('Failed to request payout')
    }
  }

  const handlePayoutApproval = async (payoutId: string) => {
    if (!accessToken) return

    try {
      const result = await apiService.approvePayout(payoutId, accessToken)
      if (result.success && result.data) {
        toast.success('Payout approved successfully!')
        setPayoutRequests(prev => prev.map(payout =>
          payout.id === payoutId ? result.data.payout : payout
        ))
      } else {
        toast.error(result.error || 'Failed to approve payout')
      }
    } catch (error: any) {
      console.error('Error approving payout:', error)
      toast.error('Failed to approve payout')
    }
  }

  // Ticket handlers
  const handleCreateTicket = () => {
    setShowTicketModal(true)
  }

  const handleTicketSubmit = (ticketData: any) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`
    }
    setTickets(prev => [...prev, newTicket])
    toast.success('Ticket created successfully!')
  }

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket)
  }

  const handleUpdateTicket = (ticketId: string, updates: Partial<Ticket>) => {
    setTickets(prev => prev.map(ticket =>
      ticket.id === ticketId ? { ...ticket, ...updates } : ticket
    ))
    
    if (selectedTicket && selectedTicket.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, ...updates } : null)
    }
    
    toast.success('Ticket updated successfully!')
  }

  const handleTicketStatusChange = (ticketId: string, newStatus: string) => {
    handleUpdateTicket(ticketId, { status: newStatus })
  }

  const handleSignOut = async () => {
    const result = await signOut()
    if (result.success) {
      toast.success('Signed out successfully!')
      setActiveView('dashboard')
      setShifts([])
      setDrivers([])
      setPayoutRequests([])
      setNotifications([])
      setTickets([])
      setSelectedTicket(null)
    } else {
      toast.error(result.error || 'Failed to sign out')
    }
  }

  // Show loading spinner while auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth page if not authenticated
  if (!user) {
    return (
      <>
        <AuthPage />
        <Toaster />
      </>
    )
  }

  const renderNotifications = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`${notification.type === 'urgent' ? 'border-red-200 bg-red-50' : ''}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium mb-1">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {notification.type === 'urgent' && (
                    <Badge variant="destructive">Urgent</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )

  const renderSettings = () => (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Settings</h2>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Role</p>
                <Badge variant="outline" className="capitalize">{user?.role}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {user?.role === 'admin' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Auto-Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-schedule frequency</h4>
                    <p className="text-sm text-muted-foreground">How often to automatically create recurring shifts</p>
                  </div>
                  <Button variant="outline">Weekly</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Call-off handling</h4>
                    <p className="text-sm text-muted-foreground">How to handle driver call-offs</p>
                  </div>
                  <Button variant="outline">Auto-assign backup</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payroll Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Instant Payouts</h4>
                    <p className="text-sm text-muted-foreground">Allow drivers to request instant payouts</p>
                  </div>
                  <Button variant="outline">Enabled</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Auto-approve payouts</h4>
                    <p className="text-sm text-muted-foreground">Automatically approve payouts under $500</p>
                  </div>
                  <Button variant="outline">Disabled</Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">SMS Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive text messages for urgent updates</p>
              </div>
              <Button variant="outline">Enabled</Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Email Notifications</h4>
                <p className="text-sm text-muted-foreground">Receive email summaries and updates</p>
              </div>
              <Button variant="outline">Enabled</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderPayroll = () => (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Payroll</h2>
        {user?.role === 'admin' && (
          <div className="flex space-x-3">
            <Button variant="outline">Export Hours</Button>
            <Button>Process Payroll</Button>
          </div>
        )}
        {user?.role === 'driver' && (
          <Button onClick={() => handlePayoutRequest(480, 32)}>
            Request Payout
          </Button>
        )}
      </div>

      {user?.role === 'admin' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Hours This Week</p>
                    <p className="text-2xl font-semibold">
                      {shifts.reduce((total, shift) => total + (shift.hoursWorked || 8), 0)}h
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Payouts</p>
                    <p className="text-2xl font-semibold">
                      ${payoutRequests.filter(p => p.status === 'pending').reduce((total, p) => total + p.amount, 0)}
                    </p>
                  </div>
                  <CreditCard className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Drivers</p>
                    <p className="text-2xl font-semibold">{drivers.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Payout Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payoutRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No payout requests</p>
                  </div>
                ) : (
                  payoutRequests.map((payout) => (
                    <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium">Driver ID: {payout.driver_id}</p>
                          <p className="text-sm text-muted-foreground">{payout.hours}h</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-medium">${payout.amount}</p>
                        <Badge className={payout.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                          {payout.status}
                        </Badge>
                        {payout.status === 'pending' && (
                          <Button size="sm" onClick={() => handlePayoutApproval(payout.id)}>
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {user?.role === 'driver' && (
        <Card>
          <CardHeader>
            <CardTitle>My Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-2xl font-semibold">32h</p>
                <p className="text-sm text-muted-foreground">Hours This Week</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold">$640</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-semibold text-green-600">$480</p>
                <p className="text-sm text-muted-foreground">Available for Payout</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderContent = () => {
    // Handle ticket detail view
    if (selectedTicket) {
      return (
        <TicketDetailView
          ticket={selectedTicket}
          onBack={() => setSelectedTicket(null)}
          onUpdateTicket={handleUpdateTicket}
        />
      )
    }

    // Handle driver role views
    if (user?.role === 'driver') {
      switch (activeView) {
        case 'dashboard':
          return <DriverDashboard />
        case 'driver-schedule':
          return <DriverDashboard />
        case 'customer-requests':
          return (
            <TicketList
              tickets={tickets}
              onCreateTicket={handleCreateTicket}
              onTicketClick={handleTicketClick}
              onStatusChange={handleTicketStatusChange}
            />
          )
        case 'notifications':
          return renderNotifications()
        case 'settings':
          return renderSettings()
        default:
          return <DriverDashboard />
      }
    }

    // Admin views
    switch (activeView) {
      case 'dashboard':
        return (
          <ComingSoonCard
            title="Dashboard"
            description="A comprehensive overview of your operations with key metrics and insights."
            icon={<LayoutDashboard className="w-8 h-8" />}
            features={[
              'Real-time metrics and KPIs',
              'Service performance analytics',
              'Route efficiency tracking',
              'Customer satisfaction scores',
              'Revenue and cost analysis',
              'Custom dashboard widgets'
            ]}
          />
        )
      case 'crm':
        return (
          <ComingSoonCard
            title="Customer Relationship Management"
            description="Manage customer relationships, track interactions, and grow your business."
            icon={<Users className="w-8 h-8" />}
            features={[
              'Customer profile management',
              'Interaction history tracking',
              'Service contract management',
              'Billing and invoicing',
              'Customer communication tools',
              'Sales pipeline tracking'
            ]}
          />
        )
      case 'customer-requests':
        return (
          <TicketList
            tickets={tickets}
            onCreateTicket={handleCreateTicket}
            onTicketClick={handleTicketClick}
            onStatusChange={handleTicketStatusChange}
          />
        )
      case 'route-planning':
        return (
          <ComingSoonCard
            title="Route Planning & Optimization"
            description="Optimize routes for efficiency and create smart scheduling solutions."
            icon={<Route className="w-8 h-8" />}
            features={[
              'Intelligent route optimization',
              'Real-time traffic integration',
              'Multi-vehicle route planning',
              'Service time estimation',
              'Fuel cost optimization',
              'Route performance analytics'
            ]}
          />
        )
      case 'driver-schedule':
        return (
          <ScheduleBoard 
            onCreateShift={handleCreateShift}
            shifts={shifts}
            onUpdateShift={handleShiftUpdate}
            onDeleteShift={handleShiftDelete}
            onEditShift={handleEditShift}
          />
        )
      case 'payroll':
        return renderPayroll()
      case 'settings':
        return renderSettings()
      case 'notifications':
        return renderNotifications()
      default:
        return (
          <ComingSoonCard
            title="Dashboard"
            description="A comprehensive overview of your operations with key metrics and insights."
            icon={<LayoutDashboard className="w-8 h-8" />}
            features={[
              'Real-time metrics and KPIs',
              'Service performance analytics',
              'Route efficiency tracking',
              'Customer satisfaction scores',
              'Revenue and cost analysis',
              'Custom dashboard widgets'
            ]}
          />
        )
    }
  }

  const overdueTicketCount = tickets.filter(ticket => {
    const today = new Date()
    const expectedDate = new Date(ticket.expectedResolutionDate)
    return expectedDate < today && ticket.status !== 'Closed'
  }).length

  const totalNotificationCount = notifications.filter(n => !n.read).length + overdueTicketCount

  return (
    <div className="min-h-screen bg-background flex relative">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        notificationCount={overdueTicketCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header
          user={{
            name: user?.name,
            email: user?.email,
            role: user?.role
          }}
          notificationCount={totalNotificationCount}
          onSettingsClick={() => setActiveView('settings')}
          onNotificationsClick={() => setActiveView('notifications')}
          onSignOut={handleSignOut}
        />

        {/* Content - with bottom padding for prompt console */}
        <main className="flex-1 p-6 overflow-auto pb-24">
          {isLoading && (
            <div className="fixed top-4 right-4 z-50">
              <Card className="p-4">
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading...</span>
                </div>
              </Card>
            </div>
          )}

          {renderContent()}
        </main>
      </div>

      {/* AI Components */}
      <PromptConsole
        onExecuteAction={handleExecuteAction}
        onOpenDisambiguation={handleOpenDisambiguation}
        onOpenConflicts={handleOpenConflicts}
      />

      <AIHelpButton 
        onClick={() => setShowAIHelp(true)}
        hasNewSuggestions={overdueTicketCount > 0}
      />

      {/* AI Panels and Drawers */}
      <AIHelpPanel
        isOpen={showAIHelp}
        onClose={() => setShowAIHelp(false)}
        onNavigate={handleAINavigation}
        tickets={tickets}
        shifts={shifts}
        drivers={drivers}
      />

      <DisambiguationDrawer
        isOpen={showDisambiguation}
        onClose={() => setShowDisambiguation(false)}
        matches={disambiguationData}
        context="customer search"
        onSelect={(match) => {
          console.log('Selected:', match)
          setShowDisambiguation(false)
          toast.success(`Selected ${match.name}`)
        }}
      />

      <ConflictDrawer
        isOpen={showConflicts}
        onClose={() => setShowConflicts(false)}
        conflicts={conflictData}
        onResolve={(conflictId, resolution) => {
          console.log('Resolved conflict:', conflictId, resolution)
          toast.success('Conflict resolved')
        }}
        onOverride={() => {
          setShowConflicts(false)
          toast.warning('Conflicts overridden')
        }}
      />

      <CoverageSuggestionDrawer
        isOpen={showCoverage}
        onClose={() => setShowCoverage(false)}
        unavailableDriver={coverageData.unavailableDriver}
        route={coverageData.route}
        shift={coverageData.shift}
        candidates={coverageData.candidates || []}
        onAssign={(candidateId) => {
          const candidate = coverageData.candidates?.find((c: any) => c.id === candidateId)
          toast.success(`${candidate?.name} assigned to cover the shift`)
          setShowCoverage(false)
        }}
        onNotify={(candidateId, method) => {
          const candidate = coverageData.candidates?.find((c: any) => c.id === candidateId)
          toast.success(`${method.toUpperCase()} notification sent to ${candidate?.name}`)
        }}
      />

      {/* Modals */}
      <ShiftForm
        open={showShiftModal}
        onOpenChange={setShowShiftModal}
        onSubmit={handleShiftSubmit}
        drivers={drivers}
        initialData={selectedShift}
        isEditing={isEditingShift}
      />

      <TicketCreationModal
        open={showTicketModal}
        onOpenChange={setShowTicketModal}
        onSubmit={handleTicketSubmit}
      />
      
      <Toaster />
    </div>
  )
}