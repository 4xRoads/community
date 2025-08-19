import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Calendar, Clock, User, Car } from 'lucide-react'

type RawShift = {
  id?: string
  driver?: string
  driverName?: string
  driver_name?: string
  route?: string
  date?: string
  vehicle?: string
  status?: 'scheduled' | 'confirmed' | 'pending' | 'called_off' | 'completed'
  // canonical
  start_time?: string
  end_time?: string
  hours_worked?: number
  backup_driver?: string
  backup_driver_name?: string
  qualification?: string[]
  // fallbacks (camelCase)
  startTime?: string
  endTime?: string
  hoursWorked?: number
  backupDriver?: string
  backupDriverName?: string
  qualifications?: string[]
}

interface DriverCardData {
  id?: string
  driver?: string
  driverName?: string
  driver_name?: string
  route?: string
  date?: string
  vehicle?: string
  start_time: string
  end_time: string
  status: 'scheduled' | 'confirmed' | 'pending' | 'called_off' | 'completed'
  hours_worked?: number
  backup_driver?: string
  backup_driver_name?: string
  qualification?: string[]
}

interface DriverCardProps {
  shift: RawShift
  compact?: boolean
  onClick?: (shiftData: DriverCardData) => void
}

function normalize(shift: RawShift): DriverCardData {
  return {
    id: shift.id,
    driver: shift.driver,
    driverName: shift.driverName,
    driver_name: shift.driver_name,
    route: shift.route,
    date: shift.date,
    vehicle: shift.vehicle,
    status: shift.status ?? 'scheduled',
    start_time: shift.start_time ?? shift.startTime ?? '08:00',
    end_time: shift.end_time ?? shift.endTime ?? '16:00',
    hours_worked: shift.hours_worked ?? shift.hoursWorked,
    backup_driver: shift.backup_driver ?? shift.backupDriver ?? 'none',
    backup_driver_name: shift.backup_driver_name ?? shift.backupDriverName,
    qualification: shift.qualification ?? shift.qualifications ?? [],
  }
}

export function DriverCard({ shift, compact = false, onClick }: DriverCardProps) {
  const data = normalize(shift)

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

  const getStatusLabel = (status: string) =>
    status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' ')

  const formatTime = (time?: string) =>
    !time ? '00:00' : (time.length > 5 ? time.substring(0, 5) : time)

  const getDisplayName = (driverId?: string, driverName?: string, driver_name?: string) => {
    if (driverName && driverName !== driverId) return driverName
    if (driver_name && driver_name !== driverId) return driver_name
    if (!driverId || driverId === 'unassigned') return 'Unassigned'
    return driverId
  }

  const getBackupDisplayName = (backupDriver?: string, backupDriverName?: string) => {
    if (backupDriverName && backupDriverName !== backupDriver) return backupDriverName
    if (!backupDriver || backupDriver === 'none' || backupDriver === 'unassigned') return 'None'
    return backupDriver
  }

  const handleClick = () => {
    onClick?.(data)
  }

  const driverDisplayName = getDisplayName(data.driver, data.driverName, data.driver_name)
  const backupDisplayName = getBackupDisplayName(data.backup_driver, data.backup_driver_name)

  return (
    <Card
      className={`hover:shadow-md transition-all cursor-pointer hover:scale-[1.02] ${compact ? 'text-sm' : ''} w-full`}
      onClick={handleClick}
    >
      <CardContent className={`${compact ? 'p-3' : 'p-4'} space-y-3`}>
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <User className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className={`font-medium break-words ${compact ? 'text-sm' : 'text-base'}`}>
              {driverDisplayName}
            </span>
          </div>
          <div className="flex justify-start">
            <Badge className={`text-xs px-2 py-1 ${getStatusColor(data.status)} w-fit`}>
              {getStatusLabel(data.status)}
            </Badge>
          </div>
        </div>

        <div className={`space-y-2 ${compact ? 'text-xs' : 'text-sm'}`}>
          <div className="flex items-start space-x-2">
            <Calendar className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className="break-words text-muted-foreground">
              {data.route || 'No route assigned'}
            </span>
          </div>
          <div className="flex items-start space-x-2">
            <Clock className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} text-muted-foreground flex-shrink-0 mt-0.5`} />
            <span className="text-muted-foreground whitespace-nowrap">
              {formatTime(data.start_time)} - {formatTime(data.end_time)}
            </span>
          </div>
          {data.vehicle && (
            <div className="flex items-start space-x-2">
              <Car className={`${compact ? 'w-2 h-2' : 'w-3 h-3'} text-muted-foreground flex-shrink-0 mt-0.5`} />
              <span className="break-words text-muted-foreground">{data.vehicle}</span>
            </div>
          )}
        </div>

        <div className="space-y-1 text-xs">
          {data.backup_driver && data.backup_driver !== 'none' && (
            <div className="text-muted-foreground">
              <span className="font-medium">Backup:</span>{' '}
              <span className="break-words">{backupDisplayName}</span>
            </div>
          )}
          {typeof data.hours_worked === 'number' && (
            <div className="text-muted-foreground">
              <span className="font-medium">Hours:</span>{' '}
              <span>{data.hours_worked}h</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
