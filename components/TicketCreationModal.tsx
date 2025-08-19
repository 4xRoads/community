import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from './ui/command'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Badge } from './ui/badge'
import { Calendar } from './ui/calendar'
import { CalendarIcon, Check, ChevronsUpDown, X } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from './ui/utils'

// Mock customer data with multiple locations
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

interface TicketCreationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
}

export function TicketCreationModal({ open, onOpenChange, onSubmit }: TicketCreationModalProps) {
  const [formData, setFormData] = useState({
    customer: '',
    customerId: '',
    location: '',
    contact: '',
    category: '',
    priority: 'Medium',
    description: '',
    attachments: [] as File[],
    route: '',
    shift: '',
    driver: '',
    vehicle: '',
    dateRequested: new Date().toISOString().split('T')[0],
    expectedResolutionDate: ''
  })

  const [customerSearch, setCustomerSearch] = useState('')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
  const [expectedDate, setExpectedDate] = useState<Date>()
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<typeof mockCustomers[0] | null>(null)

  // Filter customers based on search
  useEffect(() => {
    if (!customerSearch) {
      setFilteredCustomers(mockCustomers)
    } else {
      setFilteredCustomers(
        mockCustomers.filter(customer =>
          customer.name.toLowerCase().includes(customerSearch.toLowerCase())
        )
      )
    }
  }, [customerSearch])

  // Reset location when customer changes
  useEffect(() => {
    if (!selectedCustomer) {
      setFormData(prev => ({ ...prev, location: '' }))
    }
  }, [selectedCustomer])

  const handleCustomerSelect = (customer: typeof mockCustomers[0]) => {
    setSelectedCustomer(customer)
    setFormData(prev => ({
      ...prev,
      customer: customer.name,
      customerId: customer.id,
      location: '' // Reset location when customer changes
    }))
    setCustomerSearch(customer.name)
    setCustomerOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const submitData = {
      ...formData,
      expectedResolutionDate: expectedDate?.toISOString().split('T')[0] || formData.expectedResolutionDate,
      status: 'New'
    }
    
    onSubmit(submitData)
    onOpenChange(false)
    
    // Reset form
    setFormData({
      customer: '',
      customerId: '',
      location: '',
      contact: '',
      category: '',
      priority: 'Medium',
      description: '',
      attachments: [],
      route: '',
      shift: '',
      driver: '',
      vehicle: '',
      dateRequested: new Date().toISOString().split('T')[0],
      expectedResolutionDate: ''
    })
    setSelectedCustomer(null)
    setCustomerSearch('')
    setExpectedDate(undefined)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Ticket</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new customer service ticket.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer - Searchable Typeahead */}
            <div className="space-y-2">
              <Label htmlFor="customer">Customer *</Label>
              <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerOpen}
                    className="w-full justify-between"
                  >
                    {selectedCustomer
                      ? selectedCustomer.name
                      : "Select customer..."}
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

            {/* Location - Dependent Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => setFormData(prev => ({ ...prev, location: value }))}
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
              <Label htmlFor="contact">Contact</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                placeholder="Phone or email"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category/Type *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
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
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the issue or request..."
              rows={4}
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label htmlFor="attachments">Attachments</Label>
            <Input
              id="attachments"
              type="file"
              multiple
              onChange={handleFileUpload}
              accept="image/*,.pdf,.doc,.docx"
            />
            {formData.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.attachments.map((file, index) => (
                  <Badge key={index} variant="secondary" className="px-2 py-1">
                    {file.name}
                    <X
                      className="w-3 h-3 ml-1 cursor-pointer"
                      onClick={() => removeAttachment(index)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Route/Shift/Driver/Vehicle Links */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Related Information (Optional)</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="route">Route</Label>
                <Input
                  id="route"
                  value={formData.route}
                  onChange={(e) => setFormData(prev => ({ ...prev, route: e.target.value }))}
                  placeholder="e.g., Route A-1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shift">Shift</Label>
                <Input
                  id="shift"
                  value={formData.shift}
                  onChange={(e) => setFormData(prev => ({ ...prev, shift: e.target.value }))}
                  placeholder="e.g., Morning"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Input
                  id="driver"
                  value={formData.driver}
                  onChange={(e) => setFormData(prev => ({ ...prev, driver: e.target.value }))}
                  placeholder="Driver name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle</Label>
                <Input
                  id="vehicle"
                  value={formData.vehicle}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle: e.target.value }))}
                  placeholder="e.g., TRK-001"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={!formData.customer || !formData.location || !formData.category || !formData.description}
            >
              Create Ticket
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}