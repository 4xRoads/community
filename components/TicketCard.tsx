import { useState } from 'react'
import { Card, CardContent, CardHeader } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { MoreHorizontal } from 'lucide-react'

interface TicketCardData {
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
}

interface TicketCardProps {
  ticket: TicketCardData
  onClick?: (ticket: TicketCardData) => void
  onStatusChange?: (ticketId: string, newStatus: string) => void
}

export function TicketCard({ ticket, onClick, onStatusChange }: TicketCardProps) {
  const [ticketStatus, setTicketStatus] = useState(ticket.status)

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

  const handleStatusChange = (newStatus: string) => {
    setTicketStatus(newStatus)
    if (onStatusChange) {
      onStatusChange(ticket.id, newStatus)
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on dropdown
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return
    }
    if (onClick) {
      onClick(ticket)
    }
  }

  const isOverdue = () => {
    const today = new Date()
    const expectedDate = new Date(ticket.expectedResolutionDate)
    return expectedDate < today && ticketStatus !== 'Closed'
  }

  return (
    <Card 
      className="hover:shadow-md transition-all cursor-pointer hover:scale-[1.01]"
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium">{ticket.id}</span>
            {isOverdue() && (
              <Badge variant="destructive" className="text-xs">
                Overdue
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild data-dropdown-trigger>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleStatusChange('New')}>
                Mark as New
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Triaged')}>
                Mark as Triaged
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('In Progress')}>
                Mark as In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Resolved')}>
                Mark as Resolved
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('Closed')}>
                Mark as Closed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <h3 className="font-medium">{ticket.customer}</h3>
          <p className="text-sm text-muted-foreground">{ticket.location}</p>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-x-2">
            <Badge variant={getPriorityBadgeVariant(ticket.priority)}>
              {ticket.priority}
            </Badge>
            <Badge variant={getStatusBadgeVariant(ticketStatus)}>
              {ticketStatus}
            </Badge>
          </div>
        </div>

        <p className="text-sm">{ticket.category}</p>
        <p className="text-sm text-muted-foreground line-clamp-2">{ticket.description}</p>
        
        <div className="text-xs text-muted-foreground">
          <p>Requested: {new Date(ticket.dateRequested).toLocaleDateString()}</p>
          <p>Expected: {new Date(ticket.expectedResolutionDate).toLocaleDateString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}