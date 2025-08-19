import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Separator } from './ui/separator'
import { Progress } from './ui/progress'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer'
import { 
  User, 
  Clock, 
  Star,
  Route,
  AlertTriangle,
  CheckCircle,
  Send,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  TrendingUp
} from 'lucide-react'

interface CoverageCandidate {
  id: string
  name: string
  score: number
  availability: 'available' | 'limited' | 'overtime'
  distance: number
  routeFamiliarity: number
  currentHours: number
  maxHours: number
  license: string[]
  reasons: Array<{
    type: 'positive' | 'negative' | 'warning'
    text: string
  }>
  contact: {
    phone?: string
    email?: string
  }
  location: string
}

interface CoverageSuggestionDrawerProps {
  isOpen: boolean
  onClose: () => void
  unavailableDriver: string
  route: string
  shift: string
  candidates: CoverageCandidate[]
  onAssign: (candidateId: string) => void
  onNotify: (candidateId: string, method: 'sms' | 'email') => void
}

export function CoverageSuggestionDrawer({ 
  isOpen, 
  onClose, 
  unavailableDriver,
  route,
  shift,
  candidates, 
  onAssign,
  onNotify 
}: CoverageSuggestionDrawerProps) {
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [notificationsSent, setNotificationsSent] = useState<Set<string>>(new Set())

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'text-green-600 bg-green-50 border-green-200'
      case 'limited': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'overtime': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const handleNotify = (candidateId: string, method: 'sms' | 'email') => {
    onNotify(candidateId, method)
    setNotificationsSent(prev => new Set([...prev, `${candidateId}-${method}`]))
  }

  const isNotificationSent = (candidateId: string, method: 'sms' | 'email') => {
    return notificationsSent.has(`${candidateId}-${method}`)
  }

  const sortedCandidates = [...candidates].sort((a, b) => b.score - a.score)

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader className="border-b border-border-soft">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-500" />
                <span>Coverage Suggestions</span>
              </DrawerTitle>
              <p className="text-muted-foreground mt-1">
                <span className="font-medium">{unavailableDriver}</span> is unavailable for{' '}
                <span className="font-medium">{route}</span> at{' '}
                <span className="font-medium">{shift}</span>. Here are the best alternatives:
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {sortedCandidates.map((candidate, index) => (
              <Card 
                key={candidate.id}
                className={`transition-all duration-200 ${
                  selectedCandidate === candidate.id
                    ? 'border-primary shadow-md'
                    : 'hover:shadow-sm'
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{candidate.name}</CardTitle>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{candidate.location}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{candidate.distance} miles away</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <span className={`text-lg font-bold ${getScoreColor(candidate.score)}`}>
                          {candidate.score}%
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getAvailabilityColor(candidate.availability)}`}
                      >
                        {candidate.availability}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Score Breakdown */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Route Familiarity</span>
                        <span>{candidate.routeFamiliarity}%</span>
                      </div>
                      <Progress value={candidate.routeFamiliarity} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Weekly Hours</span>
                        <span>{candidate.currentHours}/{candidate.maxHours}h</span>
                      </div>
                      <Progress value={(candidate.currentHours / candidate.maxHours) * 100} className="h-2" />
                    </div>
                  </div>

                  {/* Licenses */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Licenses:</span>
                    <div className="flex flex-wrap gap-1">
                      {candidate.license.map((license) => (
                        <Badge key={license} variant="secondary" className="text-xs">
                          {license}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium">Assessment:</span>
                    <div className="space-y-1">
                      {candidate.reasons.map((reason, reasonIndex) => (
                        <div key={reasonIndex} className="flex items-center space-x-2">
                          {reason.type === 'positive' && (
                            <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          )}
                          {reason.type === 'negative' && (
                            <X className="w-3 h-3 text-red-500 flex-shrink-0" />
                          )}
                          {reason.type === 'warning' && (
                            <AlertTriangle className="w-3 h-3 text-yellow-500 flex-shrink-0" />
                          )}
                          <span className="text-sm text-muted-foreground">{reason.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-border-soft">
                    <div className="flex space-x-2">
                      {/* SMS Notification */}
                      {candidate.contact.phone && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotify(candidate.id, 'sms')}
                          disabled={isNotificationSent(candidate.id, 'sms')}
                        >
                          <Phone className="w-3 h-3 mr-1" />
                          {isNotificationSent(candidate.id, 'sms') ? 'SMS Sent' : 'Notify SMS'}
                        </Button>
                      )}

                      {/* Email Notification */}
                      {candidate.contact.email && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleNotify(candidate.id, 'email')}
                          disabled={isNotificationSent(candidate.id, 'email')}
                        >
                          <Mail className="w-3 h-3 mr-1" />
                          {isNotificationSent(candidate.id, 'email') ? 'Email Sent' : 'Notify Email'}
                        </Button>
                      )}
                    </div>

                    <Button
                      onClick={() => onAssign(candidate.id)}
                      className={candidate.score >= 70 ? '' : 'bg-yellow-600 hover:bg-yellow-700'}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Assign to Shift
                    </Button>
                  </div>
                </CardContent>

                {index < sortedCandidates.length - 1 && <Separator className="mt-4" />}
              </Card>
            ))}
          </div>

          {/* Summary Actions */}
          <div className="mt-8 pt-6 border-t border-border-soft">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing {candidates.length} available drivers • Best match: {sortedCandidates[0]?.name}
              </div>
              
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button onClick={() => onAssign(sortedCandidates[0]?.id)}>
                  Assign Best Match
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}