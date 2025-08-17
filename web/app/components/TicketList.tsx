import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import { Plus, Search, AlertTriangle, MoreHorizontal } from 'lucide-react'

export interface Ticket {
  id: string
  customer: string
  location: string
  contact: string
  category: string
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  dateRequested: string
  expectedResolutionDate: string
  status: 'New' | 'Triaged' | 'In Progress' | 'Resolved' | 'Closed'
  description: string
  assignedTo?: string
  route?: string
  shift?: string
  driver?: string
  vehicle?: string
}

interface TicketListProps {
  tickets: Ticket[]
  onCreateTicket: () => void
  onTicketClick: (ticket: Ticket) => void
  onStatusChange?: (ticketId: string, newStatus: string) => void
}

export function TicketList({ tickets, onCreateTicket, onTicketClick, onStatusChange }: TicketListProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showOverdueOnly, setShowOverdueOnly] = useState(false)

  const isOverdue = (ticket: Ticket) => {
    const today = new Date()
    const expectedDate = new Date(ticket.expectedResolutionDate)
    return expectedDate < today && ticket.status !== 'Closed'
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'all' || ticket.category === categoryFilter
    const matchesOverdue = !showOverdueOnly || isOverdue(ticket)

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesOverdue
  })

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'New': return 'default'
      case 'Triaged': return 'secondary'
      case 'In Progress': return 'outline'
      case 'Resolved': return 'secondary'
      case 'Closed': return 'outline'
      default: return 'default'
    }
  }

  const getPriorityBadgeVariant = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'destructive'
      case 'High': return 'destructive'
      case 'Medium': return 'secondary'
      case 'Low': return 'outline'
      default: return 'outline'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Customer Requests</h2>
          <p className="text-muted-foreground mt-1">
            Manage customer service tickets and requests
          </p>
        </div>
        <Button onClick={onCreateTicket}>
          <Plus className="w-4 h-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tickets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Triaged">Triaged</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="Critical">Critical</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Bin Drops">Bin Drops</SelectItem>
                <SelectItem value="Bin Swap">Bin Swap</SelectItem>
                <SelectItem value="Bin Removal">Bin Removal</SelectItem>
                <SelectItem value="Missed Service">Missed Service</SelectItem>
                <SelectItem value="Skip Service">Skip Service</SelectItem>
                <SelectItem value="Change Service Day">Change Service Day</SelectItem>
                <SelectItem value="Add Service Day">Add Service Day</SelectItem>
                <SelectItem value="Remove Service Day">Remove Service Day</SelectItem>
                <SelectItem value="Start Service">Start Service</SelectItem>
                <SelectItem value="End Service">End Service</SelectItem>
                <SelectItem value="Bin Issue">Bin Issue</SelectItem>
                <SelectItem value="Service Issue">Service Issue</SelectItem>
                <SelectItem value="Service Unsuccessful">Service Unsuccessful</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showOverdueOnly ? "default" : "outline"}
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              className="flex items-center"
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Overdue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tickets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead>Expected Resolution</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {tickets.length === 0 ? 'No tickets found' : 'No tickets match your filters'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map((ticket) => (
                  <TableRow 
                    key={ticket.id} 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onTicketClick(ticket)}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{ticket.id}</span>
                        {isOverdue(ticket) && (
                          <Badge variant="destructive" className="text-xs">
                            Overdue
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{ticket.customer}</TableCell>
                    <TableCell>{ticket.location}</TableCell>
                    <TableCell>{ticket.category}</TableCell>
                    <TableCell>
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.dateRequested).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(ticket.expectedResolutionDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(ticket.id, 'New')
                          }}>
                            Mark as New
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(ticket.id, 'Triaged')
                          }}>
                            Mark as Triaged
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(ticket.id, 'In Progress')
                          }}>
                            Mark as In Progress
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(ticket.id, 'Resolved')
                          }}>
                            Mark as Resolved
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation()
                            onStatusChange?.(ticket.id, 'Closed')
                          }}>
                            Mark as Closed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
