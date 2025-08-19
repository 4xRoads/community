import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar } from './ui/calendar'
import { 
  ArrowLeft, 
  Edit3, 
  Save, 
  X, 
  Check,
  ChevronsUpDown,
  CalendarIcon,
  Clock,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Tag,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Minus
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from './ui/utils'
import type { Ticket } from './TicketList'

// Mock customer data (same as TicketCreationModal)
const mockCustomers = [
  {
    id: 'cust-001',
    name: 'ACME Market',
    locations: ['123 Main St', '456 Oak Ave - West Store', '789 Pine Rd - Distribution Center']
  },
  {
    id: 'cust-002', 
    name: 'Fresh Foods',
    locations: ['321 Elm St', '654 Maple Ave - Storage Facility']
  },
  {
    id: 'cust-003',
    name: 'ABC Manufacturing',
    locations: ['Building A, Floor 2', 'Building B, Floor 1', 'Warehouse Complex - Zone C']
  },
  {
    id: 'cust-004',
    name: 'City Mall',
    locations: ['Food Court', 'Main Entrance', 'Service Corridor Level B2']
  },
  {
    id: 'cust-005',
    name: 'Green Valley Apartments',
    locations: ['Unit 15B', 'Unit 22A', 'Community Center', 'Maintenance Building']
  }
]

interface TicketDetailViewProps {
  ticket: Ticket
  onBack: () => void
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
}

interface ActivityEntry {
  id: string
  timestamp: Date
  type: 'status_change' | 'field_edit' | 'comment' | 'assignment'
  user: string
  description: string
  changes?: { field: string, oldValue: string, newValue: string }[]
}

export function TicketDetailView({ ticket, onBack, onUpdateTicket }: TicketDetailViewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState(ticket)
  const [customerSearch, setCustomerSearch] = useState(ticket.customer)
  const [customerOpen, setCustomerOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [expectedDate, setExpectedDate] = useState<Date | undefined>(
    ticket.expectedResolutionDate ? new Date(ticket.expectedResolutionDate) : undefined
  )
  const [selectedCustomer, setSelectedCustomer] = useState(
    mockCustomers.find(c => c.name === ticket.customer) || null
  )

  // Mock activity history
  const [activityHistory] = useState<ActivityEntry[]>([
    {
      id: '1',
      timestamp: new Date('2024-01-15T09:30:00'),
      type: 'status_change',
      user: 'System',
      description: 'Ticket created',
      changes: [{ field: 'Status', oldValue: '', newValue: 'New' }]
    },
    {
      id: '2',
      timestamp: new Date('2024-01-15T10:15:00'),
      type: 'assignment',
      user: 'Sarah Jones',
      description: 'Ticket assigned to sarah.jones',
      changes: [{ field: 'Assigned To', oldValue: 'Unassigned', newValue: 'sarah.jones' }]
    },
    {
      id: '3',
      timestamp: new Date('2024-01-15T14:22:00'),
      type: 'status_change',
      user: 'Sarah Jones',
      description: 'Status updated to Triaged',
      changes: [{ field: 'Status', oldValue: 'New', newValue: 'Triaged' }]
    }
  ])

  const filteredCustomers = mockCustomers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Triaged': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'In Progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Resolved': return 'bg-green-100 text-green-800 border-green-200'
      case 'Closed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'Low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const isOverdue = () => {
    if (!ticket.expectedResolutionDate || ticket.status === 'Closed') return false
    const today = new Date()
    const expectedDate = new Date(ticket.expectedResolutionDate)
    return expectedDate < today
  }

  const handleCustomerSelect = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer)
    setEditData(prev => ({
      ...prev,
      customer: customer.name,
      location: '' // Reset location when customer changes
    }))
    setCustomerSearch(customer.name)
    setCustomerOpen(false)
  }

  const handleSaveEdit = () => {
    const changes: { field: string, oldValue: string, newValue: string }[] = []
    
    // Track changes
    Object.keys(editData).forEach(key => {
      const oldValue = (ticket as any)[key]
      const newValue = (editData as any)[key]
      if (oldValue !== newValue) {
        changes.push({
          field: key.charAt(0).toUpperCase() + key.slice(1),
          oldValue: String(oldValue || ''),
          newValue: String(newValue || '')
        })
      }
    })

    // Add expected resolution date change if applicable
    if (expectedDate) {
      const newDateStr = expectedDate.toISOString().split('T')[0]
      if (newDateStr !== ticket.expectedResolutionDate) {
        changes.push({
          field: 'Expected Resolution Date',
          oldValue: ticket.expectedResolutionDate || '',
          newValue: newDateStr
        })
      }
      editData.expectedResolutionDate = newDateStr
    }

    onUpdateTicket(ticket.id, editData)
    
    // Add activity entry for the edit (in a real app, this would be handled by the backend)
    if (changes.length > 0) {
      const newActivity: ActivityEntry = {
        id: Date.now().toString(),
        timestamp: new Date(),
        type: 'field_edit',
        user: 'Current User',
        description: `Updated ${changes.length} field${changes.length > 1 ? 's' : ''}`,
        changes
      }
      activityHistory.unshift(newActivity)
    }

    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setEditData(ticket)
    setCustomerSearch(ticket.customer)
    setSelectedCustomer(mockCustomers.find(c => c.name === ticket.customer) || null)
    setExpectedDate(ticket.expectedResolutionDate ? new Date(ticket.expectedResolutionDate) : undefined)
    setIsEditing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'field_edit': return <Edit3 className="w-4 h-4 text-blue-600" />
      case 'comment': return <FileText className="w-4 h-4 text-gray-600" />
      case 'assignment': return <User className="w-4 h-4 text-purple-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tickets
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">{ticket.id}</h1>
            <p className="text-muted-foreground">{ticket.customer}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {isOverdue() && (
            <Badge variant="destructive">Overdue</Badge>
          )}
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status}
          </Badge>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit Ticket</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button onClick={handleSaveEdit} size="sm">
                <Save className="w-4 h-4 mr-1" />
                Save
              </Button>
              <Button variant="outline" onClick={handleCancelEdit} size="sm">
                <X className="w-4 h-4 mr-1" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!isEditing ? (
                <>
                  {/* View Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Customer</p>
                          <p className="font-medium">{ticket.customer}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{ticket.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Contact</p>
                          <p className="font-medium">{ticket.contact || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Tag className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Category</p>
                          <p className="font-medium">{ticket.category}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Priority</p>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Expected Resolution</p>
                          <p className="font-medium">
                            {ticket.expectedResolutionDate 
                              ? format(new Date(ticket.expectedResolutionDate), 'PPP')
                              : 'Not set'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm leading-relaxed">{ticket.description}</p>
                  </div>

                  {/* Related Information */}
                  {(ticket.route || ticket.shift || ticket.driver || ticket.vehicle) && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-sm text-muted-foreground mb-3">Related Information</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {ticket.route && (
                            <div>
                              <span className="text-muted-foreground">Route:</span>
                              <span className="ml-2 font-medium">{ticket.route}</span>
                            </div>
                          )}
                          {ticket.shift && (
                            <div>
                              <span className="text-muted-foreground">Shift:</span>
                              <span className="ml-2 font-medium">{ticket.shift}</span>
                            </div>
                          )}
                          {ticket.driver && (
                            <div>
                              <span className="text-muted-foreground">Driver:</span>
                              <span className="ml-2 font-medium">{ticket.driver}</span>
                            </div>
                          )}
                          {ticket.vehicle && (
                            <div>
                              <span className="text-muted-foreground">Vehicle:</span>
                              <span className="ml-2 font-medium">{ticket.vehicle}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Customer - Searchable */}
                    <div className="space-y-2">
                      <Label>Customer *</Label>
                      <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={customerOpen}
                            className="w-full justify-between"
                          >
                            {selectedCustomer ? selectedCustomer.name : "Select customer..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput 
                              placeholder="Search customers..." 
                              value={customerSearch}
                              onValueChange={setCustomerSearch}
                            />
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandList>
                              <CommandGroup>
                                {filteredCustomers.map((customer) => (
                                  <CommandItem
                                    key={customer.id}
                                    onSelect={() => handleCustomerSelect(customer)}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedCustomer?.id === customer.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {customer.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Location - Dependent */}
                    <div className="space-y-2">
                      <Label>Location *</Label>
                      <Select
                        value={editData.location}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, location: value }))}
                        disabled={!selectedCustomer}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={selectedCustomer ? "Select location..." : "Select customer first"} />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCustomer?.locations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Contact */}
                    <div className="space-y-2">
                      <Label>Contact</Label>
                      <Input
                        value={editData.contact}
                        onChange={(e) => setEditData(prev => ({ ...prev, contact: e.target.value }))}
                        placeholder="Phone or email"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <Label>Category/Type *</Label>
                      <Select
                        value={editData.category}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Missed Service">Missed Service</SelectItem>
                          <SelectItem value="Bin Drops">Bin Drops</SelectItem>
                          <SelectItem value="Bin Swap">Bin Swap</SelectItem>
                          <SelectItem value="Bin Issue">Bin Issue</SelectItem>
                          <SelectItem value="Service Issue">Service Issue</SelectItem>
                          <SelectItem value="Billing">Billing</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select
                        value={editData.priority}
                        onValueChange={(value) => setEditData(prev => ({ ...prev, priority: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Low">Low</SelectItem>
                          <SelectItem value="Medium">Medium</SelectItem>
                          <SelectItem value="High">High</SelectItem>
                          <SelectItem value="Critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Expected Resolution Date */}
                    <div className="space-y-2">
                      <Label>Expected Resolution Date</Label>
                      <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !expectedDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {expectedDate ? format(expectedDate, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={expectedDate}
                            onSelect={(date) => {
                              setExpectedDate(date)
                              setDatePickerOpen(false)
                            }}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label>Description *</Label>
                    <Textarea
                      value={editData.description}
                      onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  {/* Related Information */}
                  <div className="space-y-2">
                    <Label>Related Information</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Route</Label>
                        <Input
                          value={editData.route || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, route: e.target.value }))}
                          placeholder="e.g., Route A-1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Shift</Label>
                        <Input
                          value={editData.shift || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, shift: e.target.value }))}
                          placeholder="e.g., Morning"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Driver</Label>
                        <Input
                          value={editData.driver || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, driver: e.target.value }))}
                          placeholder="Driver name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Vehicle</Label>
                        <Input
                          value={editData.vehicle || ''}
                          onChange={(e) => setEditData(prev => ({ ...prev, vehicle: e.target.value }))}
                          placeholder="e.g., TRK-001"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activityHistory.map((activity, index) => (
                  <div key={activity.id} className="flex space-x-3">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.description}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(activity.timestamp, 'MMM d, yyyy h:mm a')}
                      </div>
                      {activity.changes && activity.changes.length > 0 && (
                        <div className="mt-2 text-xs space-y-1">
                          {activity.changes.map((change, changeIndex) => (
                            <div key={changeIndex} className="bg-muted/50 rounded p-2">
                              <span className="font-medium">{change.field}:</span>{' '}
                              <span className="text-muted-foreground line-through">{change.oldValue || '(empty)'}</span>{' '}
                              → <span className="text-green-600">{change.newValue}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
