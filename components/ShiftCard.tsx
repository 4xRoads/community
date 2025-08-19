import { useState } from 'react'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Calendar, Clock, User, Car, MoreHorizontal, Edit3, X, Check } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'

interface Shift {
  id: string
  driver: string
  route: string
  date: string
  startTime: string
  endTime: string
  vehicle: string
  status: 'scheduled' | 'confirmed' | 'pending' | 'called_off' | 'completed'
  backupDriver?: string
  hoursWorked?: number
}

interface ShiftCardProps {
  shift: Shift
  onUpdate?: (data: any) => void
  onDelete?: (shiftId: string) => void
  compact?: boolean
}

export function ShiftCard({ shift, onUpdate, onDelete, compact = false }: ShiftCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editStatus, setEditStatus] = useState(shift.status)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'called_off': return 'bg-red-100 text-red-800 border-red-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusLabel = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')
  }

  const handleStatusSave = () => {
    if (onUpdate) {
      onUpdate({ status: editStatus })
    }
    setIsEditing(false)
  }

  const handleStatusCancel = () => {
    setEditStatus(shift.status)
    setIsEditing(false)
  }

  const formatTime = (time: string) => {
    if (!time) return '00:00'
    // Handle both HH:mm and HH:mm:ss formats
    return time.length > 5 ? time.substring(0, 5) : time
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${compact ? 'text-sm' : ''}`}>
      <CardContent className={compact ? 'p-3' : 'p-4'}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <User className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground`} />
            <span className="font-medium truncate">{shift.driver || 'Unassigned'}</span>
          </div>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="h-6 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="called_off">Called Off</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm" onClick={handleStatusSave} className="h-6 w-6 p-0">
                  <Check className="w-3 h-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleStatusCancel} className="h-6 w-6 p-0">
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <>
                <Badge 
                  className={`text-xs px-2 py-1 cursor-pointer ${getStatusColor(shift.status)}`}
                  onClick={() => setIsEditing(true)}
                >
                  {getStatusLabel(shift.status)}
                </Badge>
                {!compact && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Status
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onDelete?.(shift.id)}
                        className="text-destructive"
                      >
                        Delete Shift
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </div>
        </div>

        <div className={`space-y-1 ${compact ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Calendar className={`${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
            <span className="truncate">{shift.route || 'No route assigned'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-muted-foreground">
            <Clock className={`${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
            <span>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</span>
          </div>
          
          {shift.vehicle && (
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Car className={`${compact ? 'w-2 h-2' : 'w-3 h-3'}`} />
              <span className="truncate">{shift.vehicle}</span>
            </div>
          )}
        </div>

        {shift.backupDriver && (
          <div className={`mt-2 ${compact ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
            Backup: {shift.backupDriver}
          </div>
        )}

        {shift.hoursWorked !== undefined && (
          <div className={`mt-2 ${compact ? 'text-xs' : 'text-xs'} text-muted-foreground`}>
            Hours: {shift.hoursWorked}h
          </div>
        )}
      </CardContent>
    </Card>
  )
}