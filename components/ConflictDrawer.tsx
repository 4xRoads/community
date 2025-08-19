import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer'
import { 
  AlertTriangle, 
  Clock, 
  User, 
  Calendar,
  Route,
  AlertCircle,
  CheckCircle,
  X,
  ArrowRight
} from 'lucide-react'

interface Conflict {
  id: string
  type: 'double_booking' | 'overtime_risk' | 'license_mismatch' | 'vehicle_unavailable' | 'route_conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  details: Record<string, any>
  suggestions?: Array<{
    id: string
    title: string
    description: string
    action: 'reassign' | 'modify_time' | 'use_backup' | 'override'
  }>
}

interface ConflictDrawerProps {
  isOpen: boolean
  onClose: () => void
  conflicts: Conflict[]
  onResolve: (conflictId: string, resolution: string) => void
  onOverride: () => void
}

export function ConflictDrawer({ 
  isOpen, 
  onClose, 
  conflicts, 
  onResolve,
  onOverride 
}: ConflictDrawerProps) {
  const [selectedResolutions, setSelectedResolutions] = useState<Record<string, string>>({})

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'double_booking': return <Calendar className="w-4 h-4" />
      case 'overtime_risk': return <Clock className="w-4 h-4" />
      case 'license_mismatch': return <User className="w-4 h-4" />
      case 'vehicle_unavailable': return <AlertTriangle className="w-4 h-4" />
      case 'route_conflict': return <Route className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  const handleResolutionSelect = (conflictId: string, resolutionId: string) => {
    setSelectedResolutions(prev => ({
      ...prev,
      [conflictId]: resolutionId
    }))
  }

  const handleResolveAll = () => {
    Object.entries(selectedResolutions).forEach(([conflictId, resolutionId]) => {
      onResolve(conflictId, resolutionId)
    })
    onClose()
  }

  const canResolveAll = conflicts.every(conflict => 
    selectedResolutions[conflict.id] || conflict.severity === 'low'
  )

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="border-b border-border-soft">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <span>Scheduling Conflicts Detected</span>
              </DrawerTitle>
              <p className="text-muted-foreground mt-1">
                Found {conflicts.length} conflicts that need to be resolved before proceeding.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-6">
            {conflicts.map((conflict, index) => (
              <Card key={conflict.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${getSeverityColor(conflict.severity)}`}>
                        {getTypeIcon(conflict.type)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{conflict.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">{conflict.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${getSeverityColor(conflict.severity)}`}
                    >
                      {conflict.severity}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Conflict Details */}
                  <div className="grid grid-cols-2 gap-4 p-3 bg-muted/30 rounded-lg">
                    {Object.entries(conflict.details).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <span className="text-xs text-muted-foreground capitalize">
                          {key.replace(/_/g, ' ')}:
                        </span>
                        <p className="text-sm font-medium">{String(value)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Resolution Options */}
                  {conflict.suggestions && conflict.suggestions.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium">Resolution Options:</h4>
                      <div className="space-y-2">
                        {conflict.suggestions.map((suggestion) => (
                          <Card
                            key={suggestion.id}
                            className={`cursor-pointer transition-all duration-200 ${
                              selectedResolutions[conflict.id] === suggestion.id
                                ? 'border-primary bg-primary/5'
                                : 'hover:border-border-strong'
                            }`}
                            onClick={() => handleResolutionSelect(conflict.id, suggestion.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                  selectedResolutions[conflict.id] === suggestion.id
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground'
                                }`}>
                                  {selectedResolutions[conflict.id] === suggestion.id && (
                                    <CheckCircle className="w-2 h-2 text-primary-foreground" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium">{suggestion.title}</h5>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {suggestion.description}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {suggestion.action.replace(/_/g, ' ')}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>

                {index < conflicts.length - 1 && <Separator />}
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-border-soft">
            <div className="flex justify-between items-center">
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={onOverride}
                  className="text-orange-600 hover:text-orange-700"
                >
                  Override Conflicts
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="text-sm text-muted-foreground">
                  {Object.keys(selectedResolutions).length} of {conflicts.length} resolved
                </div>
                <Button 
                  onClick={handleResolveAll}
                  disabled={!canResolveAll}
                  className="min-w-32"
                >
                  {canResolveAll ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Resolve All
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Resolve Remaining
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}