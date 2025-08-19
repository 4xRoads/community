import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Calendar } from './ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Calendar as CalendarIcon, Plus, X, Save } from 'lucide-react'
import { format } from 'date-fns'

interface Driver {
  id: string
  name: string
  qualifications: string[]
}

interface ShiftFormData {
  driver: string // Primary driver ID
  driverName: string // Primary driver display name
  backup_drivers: string[] // Array of backup driver IDs
  backup_driver_names: string[] // Array of backup driver display names
  route: string
  date: Date | undefined
  vehicle: string
  start_time: string
  end_time: string
  status: string
  hours_worked: number
  qualification: string[]
  repeat: boolean
  repeat_frequency: 'daily' | 'weekly' | 'monthly'
  repeat_interval: number
  repeat_weekly_days: string[]
  repeat_end_type: 'never' | 'occurrences' | 'date'
  repeat_occurrences: number
  repeat_end_date: Date | undefined
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

const WEEKDAYS = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' }
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
    driver: 'unassigned',
    driverName: 'Unassigned',
    backup_drivers: [],
    backup_driver_names: [],
    route: '',
    date: new Date(),
    vehicle: '',
    start_time: '08:00',
    end_time: '16:00',
    status: 'scheduled',
    hours_worked: 8,
    qualification: [],
    repeat: false,
    repeat_frequency: 'weekly',
    repeat_interval: 1,
    repeat_weekly_days: [],
    repeat_end_type: 'never',
    repeat_occurrences: 10,
    repeat_end_date: undefined
  })

  const [qualificationSelectValue, setQualificationSelectValue] = useState('none')
  const [backupDriverSelectValue, setBackupDriverSelectValue] = useState('none')

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
      
      setFormData({
        driver: initialData.driver || 'unassigned',
        driverName: driverName,
        backup_drivers: initialData.backup_drivers || [],
        backup_driver_names: initialData.backup_driver_names || [],
        route: initialData.route || '',
        date: initialData.date || new Date(),
        vehicle: initialData.vehicle || '',
        start_time: initialData.start_time || '08:00',
        end_time: initialData.end_time || '16:00',
        status: initialData.status || 'scheduled',
        hours_worked: initialData.hours_worked || 8,
        qualification: initialData.qualification || [],
        repeat: initialData.repeat || false,
        repeat_frequency: initialData.repeat_frequency || 'weekly',
        repeat_interval: initialData.repeat_interval || 1,
        repeat_weekly_days: initialData.repeat_weekly_days || [],
        repeat_end_type: initialData.repeat_end_type || 'never',
        repeat_occurrences: initialData.repeat_occurrences || 10,
        repeat_end_date: initialData.repeat_end_date
      })
    } else if (!initialData && open) {
      // Reset to defaults for new shift
      setFormData({
        driver: 'unassigned',
        driverName: 'Unassigned',
        backup_drivers: [],
        backup_driver_names: [],
        route: '',
        date: new Date(),
        vehicle: '',
        start_time: '08:00',
        end_time: '16:00',
        status: 'scheduled',
        hours_worked: 8,
        qualification: [],
        repeat: false,
        repeat_frequency: 'weekly',
        repeat_interval: 1,
        repeat_weekly_days: [],
        repeat_end_type: 'never',
        repeat_occurrences: 10,
        repeat_end_date: undefined
      })
      setQualificationSelectValue('none')
      setBackupDriverSelectValue('none')
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

  const addBackupDriver = (driverId: string) => {
    if (driverId !== 'none' && !formData.backup_drivers.includes(driverId)) {
      const driverName = getDriverNameById(driverId)
      setFormData(prev => ({
        ...prev,
        backup_drivers: [...prev.backup_drivers, driverId],
        backup_driver_names: [...prev.backup_driver_names, driverName]
      }))
      setBackupDriverSelectValue('none')
    }
  }

  const removeBackupDriver = (driverId: string) => {
    const index = formData.backup_drivers.indexOf(driverId)
    if (index > -1) {
      setFormData(prev => ({
        ...prev,
        backup_drivers: prev.backup_drivers.filter(id => id !== driverId),
        backup_driver_names: prev.backup_driver_names.filter((_, i) => i !== index)
      }))
    }
  }

  const generateRecurrenceSummary = () => {
    if (!formData.repeat) return ''
    
    let summary = ''
    
    // Frequency
    if (formData.repeat_frequency === 'daily') {
      summary = formData.repeat_interval === 1 ? 'Daily' : `Every ${formData.repeat_interval} days`
    } else if (formData.repeat_frequency === 'weekly') {
      const dayLabels = formData.repeat_weekly_days.map(day => 
        WEEKDAYS.find(w => w.id === day)?.label
      ).filter(Boolean)
      
      if (formData.repeat_interval === 1) {
        summary = dayLabels.length > 0 ? `Weekly on ${dayLabels.join(', ')}` : 'Weekly'
      } else {
        summary = dayLabels.length > 0 
          ? `Every ${formData.repeat_interval} weeks on ${dayLabels.join(', ')}`
          : `Every ${formData.repeat_interval} weeks`
      }
    } else if (formData.repeat_frequency === 'monthly') {
      summary = formData.repeat_interval === 1 ? 'Monthly' : `Every ${formData.repeat_interval} months`
    }
    
    // End condition
    if (formData.repeat_end_type === 'never') {
      summary += ' (no end date)'
    } else if (formData.repeat_end_type === 'occurrences') {
      summary += ` for ${formData.repeat_occurrences} occurrences`
    } else if (formData.repeat_end_type === 'date' && formData.repeat_end_date) {
      summary += ` until ${format(formData.repeat_end_date, 'MMM dd, yyyy')}`
    }
    
    return summary
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Convert form data to match expected format
    const shiftData = {
      ...formData,
      date: formData.date?.toISOString().split('T')[0],
      // Maintain both ID and name for primary driver
      driver: formData.driver === 'unassigned' ? 'unassigned' : formData.driver,
      driverName: formData.driverName || getDriverNameById(formData.driver),
      // Handle backup drivers
      backupDrivers: formData.backup_drivers,
      backup_drivers: formData.backup_drivers,
      backup_driver_names: formData.backup_driver_names,
      // For API compatibility, also include these legacy fields
      startTime: formData.start_time,
      endTime: formData.end_time,
      hoursWorked: formData.hours_worked,
      qualifications: formData.qualification,
      recurring: formData.repeat,
      recurringEnd: formData.repeat_end_date?.toISOString().split('T')[0]
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

  const toggleWeeklyDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      repeat_weekly_days: prev.repeat_weekly_days.includes(day)
        ? prev.repeat_weekly_days.filter(d => d !== day)
        : [...prev.repeat_weekly_days, day]
    }))
  }

  const handleClose = () => {
    onOpenChange(false)
    setQualificationSelectValue('none')
    setBackupDriverSelectValue('none')
  }

  const availableBackupDrivers = drivers.filter(driver => 
    driver.id !== formData.driver && !formData.backup_drivers.includes(driver.id)
  )

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Shift' : 'Create New Shift'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the shift details below.' : 'Fill out the details below to create a new shift assignment.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Primary Driver</Label>
              <Select 
                value={formData.driver} 
                onValueChange={handleDriverChange}
              >
                <SelectTrigger id="driver">
                  <SelectValue placeholder="Select a primary driver" />
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
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? format(formData.date, 'PPP') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => setFormData(prev => ({ ...prev, date }))}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
                  <SelectItem value="coverage_needed">Coverage Needed</SelectItem>
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
            <Label>Backup Drivers</Label>
            <div className="space-y-3">
              <Select value={backupDriverSelectValue} onValueChange={addBackupDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Select one or more drivers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select backup driver</SelectItem>
                  {availableBackupDrivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.backup_drivers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.backup_drivers.map((driverId, index) => (
                    <Badge key={driverId} variant="secondary" className="flex items-center gap-1">
                      {formData.backup_driver_names[index] || getDriverNameById(driverId)}
                      <button
                        type="button"
                        onClick={() => removeBackupDriver(driverId)}
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

          <div className="space-y-4">
            <Label>Required Qualifications</Label>
            <div className="space-y-3">
              <Select value={qualificationSelectValue} onValueChange={addQualification}>
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
                <div className="ml-6 space-y-4 border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select 
                        value={formData.repeat_frequency} 
                        onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                          setFormData(prev => ({ ...prev, repeat_frequency: value, repeat_weekly_days: [] }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Interval</Label>
                      <Input
                        type="number"
                        min="1"
                        max="52"
                        value={formData.repeat_interval}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          repeat_interval: parseInt(e.target.value) || 1 
                        }))}
                      />
                    </div>
                  </div>

                  {formData.repeat_frequency === 'weekly' && (
                    <div className="space-y-2">
                      <Label>Days</Label>
                      <div className="flex flex-wrap gap-2">
                        {WEEKDAYS.map((day) => (
                          <button
                            key={day.id}
                            type="button"
                            onClick={() => toggleWeeklyDay(day.id)}
                            className={`px-3 py-1 text-sm rounded border transition-colors ${
                              formData.repeat_weekly_days.includes(day.id)
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-background hover:bg-muted border-border'
                            }`}
                          >
                            {day.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Label>Ends</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="never"
                          checked={formData.repeat_end_type === 'never'}
                          onChange={() => setFormData(prev => ({ ...prev, repeat_end_type: 'never' }))}
                        />
                        <Label htmlFor="never">Never</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="occurrences"
                          checked={formData.repeat_end_type === 'occurrences'}
                          onChange={() => setFormData(prev => ({ ...prev, repeat_end_type: 'occurrences' }))}
                        />
                        <Label htmlFor="occurrences">After</Label>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={formData.repeat_occurrences}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            repeat_occurrences: parseInt(e.target.value) || 10 
                          }))}
                          className="w-20"
                          disabled={formData.repeat_end_type !== 'occurrences'}
                        />
                        <span className="text-sm text-muted-foreground">occurrences</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="end-date"
                          checked={formData.repeat_end_type === 'date'}
                          onChange={() => setFormData(prev => ({ ...prev, repeat_end_type: 'date' }))}
                        />
                        <Label htmlFor="end-date">On</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={formData.repeat_end_type !== 'date'}
                              className="justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.repeat_end_date ? format(formData.repeat_end_date, 'MMM dd, yyyy') : 'Pick date'}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.repeat_end_date}
                              onSelect={(date) => setFormData(prev => ({ ...prev, repeat_end_date: date }))}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {generateRecurrenceSummary() && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Summary:</p>
                      <p className="text-sm text-muted-foreground">{generateRecurrenceSummary()}</p>
                    </div>
                  )}
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
                  <CalendarIcon className="w-4 h-4 mr-2" />
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