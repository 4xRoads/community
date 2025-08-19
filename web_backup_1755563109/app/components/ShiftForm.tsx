import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Calendar, Plus, X, Save } from 'lucide-react'

interface Driver {
  id: string
  name: string
  qualifications: string[]
}

interface ShiftFormData {
  driver: string // driver ID
  driverName: string // driver display name
  backup_driver: string // backup driver ID
  backup_driver_name: string // backup driver display name
  route: string
  date: string
  vehicle: string
  start_time: string
  end_time: string
  status: string
  hours_worked: number
  qualification: string[]
  repeat: boolean
  repeat_end_date: string
}

interface ShiftFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (shiftData: any) => void
  drivers: Driver[]
  initialData?: Partial<ShiftFormData>
  isEditing?: boolean
}

const QUALIFICATIONS = [
  'CDL-A',
  'CDL-B', 
  'CDL-C',
  'Passenger',
  'School Bus',
  'Hazmat',
  'Air Brakes',
  'Manual Transmission'
]

const VEHICLES = [
  'TRK-001',
  'TRK-002', 
  'TRK-003',
  'TRK-004',
  'TRK-005',
  'TRK-006',
  'VAN-001',
  'VAN-002'
]

const ROUTES = [
  'Route A-1',
  'Route B-2',
  'Route C-3',
  'Route D-4',
  'Route E-5',
  'Route F-6'
]

export function ShiftForm({ 
  open, 
  onOpenChange, 
  onSubmit, 
  drivers, 
  initialData,
  isEditing = false 
}: ShiftFormProps) {
  const [formData, setFormData] = useState<ShiftFormData>({
    driver: '',
    driverName: '',
    backup_driver: '',
    backup_driver_name: '',
    route: '',
    date: new Date().toISOString().split('T')[0],
    vehicle: '',
    start_time: '08:00',
    end_time: '16:00',
    status: 'scheduled',
    hours_worked: 8,
    qualification: [],
    repeat: false,
    repeat_end_date: ''
  })

  const [qualificationSelectValue, setQualificationSelectValue] = useState('none')

  // Helper function to get driver name by ID
  const getDriverNameById = (driverId: string): string => {
    if (driverId === 'unassigned' || !driverId) return 'Unassigned'
    const driver = drivers.find(d => d.id === driverId)
    return driver?.name || driverId
  }

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData && open) {
      const driverName = initialData.driverName || getDriverNameById(initialData.driver || '')
      const backupDriverName = initialData.backup_driver_name || getDriverNameById(initialData.backup_driver || '')
      
      setFormData({
        driver: initialData.driver || 'unassigned',
        driverName: driverName,
        backup_driver: initialData.backup_driver || 'none',
        backup_driver_name: backupDriverName,
        route: initialData.route || '',
        date: initialData.date || new Date().toISOString().split('T')[0],
        vehicle: initialData.vehicle || '',
        start_time: initialData.start_time || '08:00',
        end_time: initialData.end_time || '16:00',
        status: initialData.status || 'scheduled',
        hours_worked: initialData.hours_worked || 8,
        qualification: initialData.qualification || [],
        repeat: initialData.repeat || false,
        repeat_end_date: initialData.repeat_end_date || ''
      })
    } else if (!initialData && open) {
      // Reset to defaults for new shift
      setFormData({
        driver: 'unassigned',
        driverName: 'Unassigned',
        backup_driver: 'none',
        backup_driver_name: 'None',
        route: '',
        date: new Date().toISOString().split('T')[0],
        vehicle: '',
        start_time: '08:00',
        end_time: '16:00',
        status: 'scheduled',
        hours_worked: 8,
        qualification: [],
        repeat: false,
        repeat_end_date: ''
      })
      setQualificationSelectValue('none')
    }
  }, [initialData, open, drivers])

  const handleDriverChange = (driverId: string) => {
    const driverName = getDriverNameById(driverId)
    setFormData(prev => ({ 
      ...prev, 
      driver: driverId,
      driverName: driverName
    }))
  }

  const handleBackupDriverChange = (backupDriverId: string) => {
    const backupDriverName = backupDriverId === 'none' ? 'None' : getDriverNameById(backupDriverId)
    setFormData(prev => ({ 
      ...prev, 
      backup_driver: backupDriverId,
      backup_driver_name: backupDriverName
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert form data to match expected format
    const shiftData = {
      ...formData,
      // Maintain both ID and name for primary driver
      driver: formData.driver === 'unassigned' ? 'unassigned' : formData.driver,
      driverName: formData.driverName || getDriverNameById(formData.driver),
      // Handle backup driver
      backupDriver: formData.backup_driver === 'none' ? '' : formData.backup_driver,
      backup_driver: formData.backup_driver === 'none' ? '' : formData.backup_driver,
      backup_driver_name: formData.backup_driver === 'none' ? '' : formData.backup_driver_name,
      // For API compatibility, also include these legacy fields
      startTime: formData.start_time,
      endTime: formData.end_time,
      hoursWorked: formData.hours_worked,
      qualifications: formData.qualification,
      recurring: formData.repeat,
      recurringEnd: formData.repeat_end_date
    }
    
    onSubmit(shiftData)
    onOpenChange(false)
  }

  const addQualification = (qualification: string) => {
    if (qualification !== 'none' && !formData.qualification.includes(qualification)) {
      setFormData(prev => ({
        ...prev,
        qualification: [...prev.qualification, qualification]
      }))
      setQualificationSelectValue('none')
    }
  }

  const removeQualification = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualification: prev.qualification.filter(q => q !== qualification)
    }))
  }

  const handleClose = () => {
    onOpenChange(false)
    setQualificationSelectValue('none')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the shift details below.' : 'Fill out the details below to create a new shift assignment.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Assign Driver</Label>
              <Select 
                value={formData.driver} 
                onValueChange={handleDriverChange}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select a driver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select 
                value={formData.route} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, route: value }))}
              >
                <SelectTrigger id="route">
                  <SelectValue placeholder="Select a route" />
                </SelectTrigger>
                <SelectContent>
                  {ROUTES.map((route) => (
                    <SelectItem key={route} value={route}>
                      {route}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle</Label>
              <Select 
                value={formData.vehicle} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle: value }))}
              >
                <SelectTrigger id="vehicle">
                  <SelectValue placeholder="Select a vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {VEHICLES.map((vehicle) => (
                    <SelectItem key={vehicle} value={vehicle}>
                      {vehicle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="start_time">Start Time</Label>
              <Input
                id="start_time"
                type="time"
                value={formData.start_time}
                onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_time">End Time</Label>
              <Input
                id="end_time"
                type="time"
                value={formData.end_time}
                onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="called_off">Called Off</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours_worked">Hours Worked</Label>
              <Input
                id="hours_worked"
                type="number"
                min="1"
                max="24"
                value={formData.hours_worked}
                onChange={(e) => setFormData(prev => ({ ...prev, hours_worked: parseInt(e.target.value) || 8 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backup_driver">Backup Driver (Optional)</Label>
            <Select 
              value={formData.backup_driver} 
              onValueChange={handleBackupDriverChange}
            >
              <SelectTrigger id="backup_driver">
                <SelectValue placeholder="Select a backup driver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Required Qualifications</Label>
            <div className="space-y-3">
              <Select value={qualificationSelectValue} onValueChange={(value) => addQualification(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Add qualification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select qualification</SelectItem>
                  {QUALIFICATIONS.filter(q => !formData.qualification.includes(q)).map((qualification) => (
                    <SelectItem key={qualification} value={qualification}>
                      {qualification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.qualification.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.qualification.map((qualification) => (
                    <Badge key={qualification} variant="secondary" className="flex items-center gap-1">
                      {qualification}
                      <button
                        type="button"
                        onClick={() => removeQualification(qualification)}
                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {!isEditing && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="repeat"
                  checked={formData.repeat}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, repeat: !!checked }))}
                />
                <Label htmlFor="repeat">Make this a recurring shift</Label>
              </div>

              {formData.repeat && (
                <div className="ml-6 space-y-2">
                  <Label htmlFor="repeat_end_date">End Date</Label>
                  <Input
                    id="repeat_end_date"
                    type="date"
                    value={formData.repeat_end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, repeat_end_date: e.target.value }))}
                    min={formData.date}
                    required={formData.repeat}
                  />
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEditing ? (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Create Shift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
