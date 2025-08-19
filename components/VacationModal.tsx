import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { Calendar } from './ui/calendar'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog'
import { CalendarDays, Save } from 'lucide-react'
import { toast } from 'sonner@2.0.3'

interface VacationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  driverName: string
}

export function VacationModal({ open, onOpenChange, driverName }: VacationModalProps) {
  const [activeTab, setActiveTab] = useState('date-range')
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [showCoverageDialog, setShowCoverageDialog] = useState(false)

  const handleSave = () => {
    if (activeTab === 'date-range') {
      if (!startDate || !endDate) {
        toast.error('Please select both start and end dates')
        return
      }
    } else {
      if (selectedDates.length === 0) {
        toast.error('Please select at least one date')
        return
      }
    }
    
    setShowCoverageDialog(true)
  }

  const handleCoverageResponse = (findCoverage: boolean) => {
    setShowCoverageDialog(false)
    onOpenChange(false)
    
    if (findCoverage) {
      toast.success('Coverage suggestions queued')
    } else {
      toast.success('Vacation saved')
    }
    
    // Reset form
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectedDates([])
    setActiveTab('date-range')
  }

  const formatDateRange = () => {
    if (activeTab === 'date-range' && startDate && endDate) {
      return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
    } else if (activeTab === 'pick-dates' && selectedDates.length > 0) {
      return `${selectedDates.length} selected dates`
    }
    return 'No dates selected'
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CalendarDays className="w-5 h-5" />
              <span>Vacation Request - {driverName}</span>
            </DialogTitle>
            <DialogDescription>
              Schedule vacation time for {driverName}. You can either select a date range or pick specific dates.
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="date-range">Date Range</TabsTrigger>
              <TabsTrigger value="pick-dates">Pick Dates</TabsTrigger>
            </TabsList>

            <TabsContent value="date-range" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="start-date">Start Date</Label>
                  <div className="border rounded-lg p-3">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date < new Date()}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="end-date">End Date</Label>
                  <div className="border rounded-lg p-3">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date < new Date() || (startDate && date <= startDate)}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pick-dates" className="space-y-6">
              <div className="space-y-3">
                <Label>Select specific dates</Label>
                <div className="border rounded-lg p-4">
                  <Calendar
                    mode="multiple"
                    selected={selectedDates}
                    onSelect={(dates) => setSelectedDates(dates || [])}
                    disabled={(date) => date < new Date()}
                    className="w-full"
                  />
                </div>
                {selectedDates.length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Selected {selectedDates.length} date{selectedDates.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-medium">Vacation Summary</p>
                <p className="text-sm text-muted-foreground">{formatDateRange()}</p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Vacation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCoverageDialog} onOpenChange={setShowCoverageDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Find Coverage?</AlertDialogTitle>
            <AlertDialogDescription>
              Would you like to automatically search for coverage during {driverName}'s vacation time?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleCoverageResponse(false)}>
              No
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleCoverageResponse(true)}>
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}