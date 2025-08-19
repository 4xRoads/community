import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Checkbox } from './ui/checkbox'
import { Badge } from './ui/badge'
import { Calendar, Plus, X } from 'lucide-react'

interface Driver {
  id: string
  name: string
  qualifications: string[]
}

interface ShiftCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (shiftData: any) => void
  drivers: Driver[]
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
  'Bus #101',
  'Bus #102', 
  'Bus #103',
  'Van #201',
  'Van #202',
  'Truck #301'
]

const ROUTES = [
  'Route A - Downtown',
  'Route B - Airport',
  'Route C - University',
  'Route D - Hospital',
  'Route E - Shopping Center',
  'Route F - Residential'
]

export function ShiftCreationModal({ open, onOpenChange, onSubmit, drivers }: ShiftCreationModalProps) {
  const [formData, setFormData] = useState({
    driverName: '',
    driver: '',
    route: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '06:00',
    endTime: '14:00',
    vehicle: '',
    status: 'scheduled',
    qualifications: [] as string[],
    backupDriver: '',
    hoursWorked: 8,
    recurring: false,
    recurringType: 'weekly',
    recurringEnd: ''
  })

  const [qualificationSelectValue, setQualificationSelectValue] = useState('none')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Set driver name based on selected driver
    const selectedDriver = drivers.find(d => d.id === formData.driver)
    const shiftData = {
      ...formData,
      driverName: selectedDriver?.name || 'Unassigned',
      driver: formData.driver || 'unassigned'
    }
    
    onSubmit(shiftData)
    onOpenChange(false)
    
    // Reset form
    setFormData({
      driverName: '',
      driver: '',
      route: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '06:00',
      endTime: '14:00',
      vehicle: '',
      status: 'scheduled',
      qualifications: [],
      backupDriver: '',
      hoursWorked: 8,
      recurring: false,
      recurringType: 'weekly',
      recurringEnd: ''
    })
    setQualificationSelectValue('none')
  }

  const addQualification = (qualification: string) => {
    if (qualification !== 'none' && !formData.qualifications.includes(qualification)) {
      setFormData(prev => ({
        ...prev,
        qualifications: [...prev.qualifications, qualification]
      }))
      setQualificationSelectValue('none') // Reset selection
    }
  }

  const removeQualification = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      qualifications: prev.qualifications.filter(q => q !== qualification)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="shift-creation-description">
        <DialogHeader>
          <DialogTitle>Create New Shift</DialogTitle>
          <DialogDescription id="shift-creation-description">
            Fill out the details below to create a new shift assignment.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Assign Driver</Label>
              <Select value={formData.driver} onValueChange={(value) => setFormData(prev => ({ ...prev, driver: value }))}>
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
              <Select value={formData.route} onValueChange={(value) => setFormData(prev => ({ ...prev, route: value }))}>
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
              <Select value={formData.vehicle} onValueChange={(value) => setFormData(prev => ({ ...prev, vehicle: value }))}>
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
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="called-off">Called Off</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Hours Worked</Label>
              <Input
                id="hoursWorked"
                type="number"
                min="1"
                max="24"
                value={formData.hoursWorked}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursWorked: parseInt(e.target.value) || 8 }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="backupDriver">Backup Driver (Optional)</Label>
            <Input
              id="backupDriver"
              type="text"
              placeholder="Enter backup driver name"
              value={formData.backupDriver}
              onChange={(e) => setFormData(prev => ({ ...prev, backupDriver: e.target.value }))}
            />
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
                  {QUALIFICATIONS.filter(q => !formData.qualifications.includes(q)).map((qualification) => (
                    <SelectItem key={qualification} value={qualification}>
                      {qualification}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.qualifications.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.qualifications.map((qualification) => (
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

          <div className="space-y-4 border-t pt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recurring"
                checked={formData.recurring}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, recurring: !!checked }))}
              />
              <Label htmlFor="recurring">Make this a recurring shift</Label>
            </div>

            {formData.recurring && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                <div className="space-y-2">
                  <Label htmlFor="recurringType">Repeat</Label>
                  <Select value={formData.recurringType} onValueChange={(value) => setFormData(prev => ({ ...prev, recurringType: value }))}>
                    <SelectTrigger id="recurringType">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recurringEnd">End Date</Label>
                  <Input
                    id="recurringEnd"
                    type="date"
                    value={formData.recurringEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, recurringEnd: e.target.value }))}
                    min={formData.date}
                    required={formData.recurring}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Calendar className="w-4 h-4 mr-2" />
              Create Shift
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
