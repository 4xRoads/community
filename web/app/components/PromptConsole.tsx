import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Textarea } from './ui/textarea'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { 
  ChevronUp, 
  ChevronDown,
  Send,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  MapPin,
  Calendar,
  Truck,
  Route
} from 'lucide-react'

interface DetectedIntent {
  action: 'create_ticket' | 'schedule_shift' | 'mark_unavailable' | 'suggest_coverage' | 'update_shift'
  confidence: number
  fields: Record<string, any>
  warnings: string[]
}

interface PromptConsoleProps {
  onExecuteAction: (intent: DetectedIntent) => void
  onOpenDisambiguation: (matches: any[]) => void
  onOpenConflicts: (conflicts: any[]) => void
}

export function PromptConsole({ onExecuteAction, onOpenDisambiguation, onOpenConflicts }: PromptConsoleProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [detectedIntent, setDetectedIntent] = useState<DetectedIntent | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [exampleCategory, setExampleCategory] = useState<'customer-requests' | 'driver-schedule'>('customer-requests')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const customerRequestsExamples = [
    "Create a ticket for Missed Service at ACME Market, priority High, due Friday.",
    "Add a Bin Swap request for Fresh Foods next Wednesday, medium priority."
  ]

  const driverScheduleExamples = [
    "Schedule John Smith for Route 7 on Tue 6–2pm, backup Maria, vehicle Box Truck, CDL-B license.",
    "Mark Driver Lee unavailable tomorrow morning and suggest coverage for Route 4."
  ]

  const getCurrentExamples = () => {
    return exampleCategory === 'customer-requests' ? customerRequestsExamples : driverScheduleExamples
  }

  // Mock AI intent detection
  const analyzePrompt = (text: string): DetectedIntent | null => {
    if (!text.trim()) return null

    const lowerText = text.toLowerCase()
    
    // Create ticket detection
    if (lowerText.includes('ticket') || lowerText.includes('request') || lowerText.includes('issue')) {
      const fields: Record<string, any> = {}
      const warnings: string[] = []

      // Extract customer
      const acmeMatch = text.match(/acme market/i)
      const freshFoodsMatch = text.match(/fresh foods/i)
      if (acmeMatch) fields.customer = 'ACME Market'
      else if (freshFoodsMatch) fields.customer = 'Fresh Foods'
      else warnings.push('Customer not specified')

      // Extract category
      if (lowerText.includes('missed service')) fields.category = 'Missed Service'
      else if (lowerText.includes('bin swap')) fields.category = 'Bin Swap'
      else if (lowerText.includes('bin drop')) fields.category = 'Bin Drops'
      else warnings.push('Category unclear')

      // Extract priority
      if (lowerText.includes('high')) fields.priority = 'High'
      else if (lowerText.includes('medium')) fields.priority = 'Medium'
      else if (lowerText.includes('low')) fields.priority = 'Low'
      else if (lowerText.includes('critical')) fields.priority = 'Critical'
      else fields.priority = 'Medium'

      // Extract dates
      if (lowerText.includes('today')) fields.dateRequested = new Date().toISOString().split('T')[0]
      if (lowerText.includes('friday')) {
        const friday = new Date()
        friday.setDate(friday.getDate() + (5 - friday.getDay()))
        fields.expectedResolutionDate = friday.toISOString().split('T')[0]
      }
      if (lowerText.includes('wednesday') || lowerText.includes('next wednesday')) {
        const wednesday = new Date()
        wednesday.setDate(wednesday.getDate() + (3 - wednesday.getDay() + 7) % 7)
        fields.expectedResolutionDate = wednesday.toISOString().split('T')[0]
      }

      // Extract route/driver/vehicle
      const routeMatch = text.match(/route (\w+)/i)
      if (routeMatch) fields.route = `Route ${routeMatch[1]}`
      
      const driverMatch = text.match(/driver (\w+)/i)
      if (driverMatch) fields.driver = driverMatch[1]
      
      const vehicleMatch = text.match(/vehicle (\w+)/i)
      if (vehicleMatch) fields.vehicle = vehicleMatch[1]

      return {
        action: 'create_ticket',
        confidence: 0.92,
        fields,
        warnings
      }
    }

    // Schedule shift detection
    if (lowerText.includes('schedule') && (lowerText.includes('shift') || lowerText.includes('route'))) {
      const fields: Record<string, any> = {}
      const warnings: string[] = []

      // Extract driver name
      const johnMatch = text.match(/john smith/i)
      const mariaMatch = text.match(/maria/i)
      if (johnMatch) fields.driver = 'John Smith'
      else warnings.push('Driver not specified')

      if (mariaMatch) fields.backupDriver = 'Maria'

      // Extract route
      const routeMatch = text.match(/route (\w+)/i)
      if (routeMatch) fields.route = `Route ${routeMatch[1]}`
      else warnings.push('Route not specified')

      // Extract time
      const timeMatch = text.match(/(\d+)–(\d+)pm/i)
      if (timeMatch) {
        fields.startTime = `${timeMatch[1]}:00`
        fields.endTime = `${timeMatch[2]}:00`
      }

      // Extract day
      if (lowerText.includes('tue')) fields.date = getNextTuesday()
      
      // Extract vehicle
      if (lowerText.includes('box truck')) fields.vehicle = 'Box Truck'

      // Extract license requirements
      if (lowerText.includes('cdl-b')) fields.licenseRequired = 'CDL-B'

      return {
        action: 'schedule_shift',
        confidence: 0.89,
        fields,
        warnings
      }
    }

    // Mark unavailable detection
    if (lowerText.includes('unavailable') || lowerText.includes('mark')) {
      const fields: Record<string, any> = {}
      const warnings: string[] = []

      const leeMatch = text.match(/driver lee/i)
      if (leeMatch) fields.driver = 'Lee'
      else warnings.push('Driver not specified')

      if (lowerText.includes('tomorrow')) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        fields.date = tomorrow.toISOString().split('T')[0]
      }

      if (lowerText.includes('morning')) fields.timeSlot = 'morning'

      const routeMatch = text.match(/route (\w+)/i)
      if (routeMatch) fields.affectedRoute = `Route ${routeMatch[1]}`

      return {
        action: 'mark_unavailable',
        confidence: 0.85,
        fields,
        warnings
      }
    }

    // Default fallback
    return {
      action: 'create_ticket',
      confidence: 0.3,
      fields: { description: text },
      warnings: ['Could not determine specific action']
    }
  }

  const getNextTuesday = () => {
    const today = new Date()
    const daysUntilTuesday = (2 - today.getDay() + 7) % 7 || 7
    const tuesday = new Date(today)
    tuesday.setDate(today.getDate() + daysUntilTuesday)
    return tuesday.toISOString().split('T')[0]
  }

  const handlePromptChange = (value: string) => {
    setPrompt(value)
    setIsProcessing(true)
    
    // Debounced analysis
    setTimeout(() => {
      const intent = analyzePrompt(value)
      setDetectedIntent(intent)
      setIsProcessing(false)
    }, 500)
  }

  const handleRun = () => {
    if (!detectedIntent) return

    // Check for potential conflicts or disambiguation needs
    if (detectedIntent.action === 'schedule_shift' && Math.random() > 0.7) {
      onOpenConflicts([
        { type: 'double_booking', driver: 'John Smith', existingShift: 'Route 5, 2:00-6:00 PM' },
        { type: 'overtime_risk', driver: 'John Smith', currentHours: 38, newHours: 8 }
      ])
      return
    }

    if (detectedIntent.fields.customer && detectedIntent.fields.customer.includes('Market') && Math.random() > 0.8) {
      onOpenDisambiguation([
        { name: 'ACME Market', location: '123 Main St', id: 'cust-001' },
        { name: 'Fresh Market', location: '456 Oak Ave', id: 'cust-002' },
        { name: 'Super Market Plus', location: '789 Pine Rd', id: 'cust-003' }
      ])
      return
    }

    onExecuteAction(detectedIntent)
    setPrompt('')
    setDetectedIntent(null)
  }

  const handleExampleClick = (example: string) => {
    setPrompt(example)
    handlePromptChange(example)
    textareaRef.current?.focus()
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'create_ticket': return <AlertTriangle className="w-4 h-4" />
      case 'schedule_shift': return <Calendar className="w-4 h-4" />
      case 'mark_unavailable': return <User className="w-4 h-4" />
      case 'suggest_coverage': return <Route className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create_ticket': return 'Create Ticket'
      case 'schedule_shift': return 'Schedule Shift'
      case 'mark_unavailable': return 'Mark Unavailable'
      case 'suggest_coverage': return 'Suggest Coverage'
      case 'update_shift': return 'Update Shift'
      default: return 'Unknown Action'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600'
    if (confidence >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const renderFieldPreview = (fields: Record<string, any>) => {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(fields).map(([key, value]) => (
          <div key={key} className="flex items-center space-x-2 text-sm">
            {key === 'customer' && <User className="w-3 h-3 text-muted-foreground" />}
            {key === 'location' && <MapPin className="w-3 h-3 text-muted-foreground" />}
            {key === 'date' && <Calendar className="w-3 h-3 text-muted-foreground" />}
            {key === 'route' && <Route className="w-3 h-3 text-muted-foreground" />}
            {key === 'vehicle' && <Truck className="w-3 h-3 text-muted-foreground" />}
            {!['customer', 'location', 'date', 'route', 'vehicle'].includes(key) && 
              <div className="w-3 h-3 bg-muted rounded-full" />}
            <div>
              <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
              <span className="ml-1 font-medium">{String(value)}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-background border-t border-border-soft">
      {/* Toggle Header */}
      <div 
        className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="font-medium">AI Prompt Console</span>
          {detectedIntent && (
            <Badge variant="outline" className="text-xs">
              {getActionLabel(detectedIntent.action)}
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm">
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </Button>
      </div>

      {/* Main Console Content */}
      {isExpanded && (
        <div className="p-4 border-t border-border-soft bg-surface-1">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left: Prompt Input */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Natural Language Prompt</label>
                  <div className="relative">
                    <Textarea
                      ref={textareaRef}
                      value={prompt}
                      onChange={(e) => handlePromptChange(e.target.value)}
                      placeholder="Describe what you want to do..."
                      rows={3}
                      className="resize-none pr-12"
                    />
                    <Button
                      size="sm"
                      onClick={handleRun}
                      disabled={!detectedIntent || detectedIntent.confidence < 0.3}
                      className="absolute bottom-2 right-2"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Example Categories */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <label className="text-sm font-medium">Examples</label>
                    <div className="flex space-x-1">
                      <Button
                        variant={exampleCategory === 'customer-requests' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExampleCategory('customer-requests')}
                        className="text-xs h-6 px-2"
                      >
                        Customer Requests
                      </Button>
                      <Button
                        variant={exampleCategory === 'driver-schedule' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setExampleCategory('driver-schedule')}
                        className="text-xs h-6 px-2"
                      >
                        Driver Schedule
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {getCurrentExamples().map((example, index) => (
                      <button
                        key={index}
                        onClick={() => handleExampleClick(example)}
                        className="text-left text-xs text-muted-foreground hover:text-foreground p-2 rounded border border-transparent hover:border-border-soft hover:bg-muted/50 transition-colors w-full"
                      >
                        "{example}"
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: Intent & Draft Preview */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Intent & Preview</label>
                  
                  {isProcessing && (
                    <Card className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground">Analyzing prompt...</span>
                      </div>
                    </Card>
                  )}

                  {detectedIntent && !isProcessing && (
                    <Card className="p-4 space-y-4">
                      {/* Detected Action */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getActionIcon(detectedIntent.action)}
                          <span className="font-medium">{getActionLabel(detectedIntent.action)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">Confidence:</span>
                          <span className={`text-sm font-medium ${getConfidenceColor(detectedIntent.confidence)}`}>
                            {Math.round(detectedIntent.confidence * 100)}%
                          </span>
                        </div>
                      </div>

                      <Progress value={detectedIntent.confidence * 100} className="h-2" />

                      {/* Extracted Fields */}
                      {Object.keys(detectedIntent.fields).length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium">Extracted Fields:</span>
                          {renderFieldPreview(detectedIntent.fields)}
                        </div>
                      )}

                      {/* Warnings */}
                      {detectedIntent.warnings.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-sm font-medium text-yellow-600">Validation Warnings:</span>
                          <div className="space-y-1">
                            {detectedIntent.warnings.map((warning, index) => (
                              <div key={index} className="flex items-center space-x-2 text-sm text-yellow-600">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{warning}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </Card>
                  )}

                  {!detectedIntent && !isProcessing && prompt && (
                    <Card className="p-4 text-center text-muted-foreground">
                      <Lightbulb className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Start typing to see AI analysis...</p>
                    </Card>
                  )}
                </div>
              </div>

              {/* Right: Result & Actions */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Actions</label>
                  
                  {detectedIntent && (
                    <div className="space-y-3">
                      <Button 
                        onClick={handleRun}
                        disabled={detectedIntent.confidence < 0.3}
                        className="w-full"
                        size="lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {getActionLabel(detectedIntent.action)}
                      </Button>

                      <Button variant="outline" className="w-full">
                        Edit in Form
                      </Button>

                      {detectedIntent.confidence < 0.6 && (
                        <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Low confidence. Consider using the form editor for better results.
                        </div>
                      )}
                    </div>
                  )}

                  {!detectedIntent && (
                    <Card className="p-4 text-center text-muted-foreground">
                      <Clock className="w-8 h-8 mx-auto mb-2" />
                      <p className="text-sm">Actions will appear here after analysis</p>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
