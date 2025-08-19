import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from './ui/drawer'
import { 
  MapPin, 
  User, 
  Phone, 
  Truck,
  Route,
  CheckCircle,
  X
} from 'lucide-react'

interface DisambiguationMatch {
  id: string
  type: 'customer' | 'driver' | 'route' | 'vehicle'
  name: string
  location?: string
  contact?: string
  details?: Record<string, any>
  metadata?: string[]
}

interface DisambiguationDrawerProps {
  isOpen: boolean
  onClose: () => void
  matches: DisambiguationMatch[]
  context: string
  onSelect: (match: DisambiguationMatch) => void
}

export function DisambiguationDrawer({ 
  isOpen, 
  onClose, 
  matches, 
  context, 
  onSelect 
}: DisambiguationDrawerProps) {
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'customer': return <User className="w-4 h-4" />
      case 'driver': return <User className="w-4 h-4" />
      case 'route': return <Route className="w-4 h-4" />
      case 'vehicle': return <Truck className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'customer': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'driver': return 'text-green-600 bg-green-50 border-green-200'
      case 'route': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'vehicle': return 'text-orange-600 bg-orange-50 border-orange-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader className="border-b border-border-soft">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Multiple Matches Found</DrawerTitle>
              <p className="text-muted-foreground mt-1">
                Found {matches.length} matches for "{context}". Please select the correct one:
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DrawerHeader>

        <div className="p-6 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {matches.map((match) => (
              <Card 
                key={match.id}
                className="cursor-pointer hover:shadow-md transition-all duration-200 hover:border-primary/50"
                onClick={() => onSelect(match)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getIcon(match.type)}
                      <CardTitle className="text-lg">{match.name}</CardTitle>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${getTypeColor(match.type)}`}
                    >
                      {match.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Location */}
                  {match.location && (
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground truncate">{match.location}</span>
                    </div>
                  )}

                  {/* Contact */}
                  {match.contact && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{match.contact}</span>
                    </div>
                  )}

                  {/* Additional Details */}
                  {match.details && Object.keys(match.details).length > 0 && (
                    <div className="space-y-1">
                      {Object.entries(match.details).slice(0, 3).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-xs">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Metadata Tags */}
                  {match.metadata && match.metadata.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {match.metadata.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {match.metadata.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{match.metadata.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  <Button 
                    className="w-full mt-3" 
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelect(match)
                    }}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Select This {match.type}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Cancel Option */}
          <div className="mt-6 pt-4 border-t border-border-soft">
            <div className="flex justify-center space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button variant="ghost" onClick={onClose}>
                I'll specify manually
              </Button>
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
