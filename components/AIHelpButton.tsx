import { useState } from 'react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { HelpCircle, MessageSquare, Sparkles } from 'lucide-react'

interface AIHelpButtonProps {
  onClick: () => void
  hasNewSuggestions?: boolean
}

export function AIHelpButton({ onClick, hasNewSuggestions = false }: AIHelpButtonProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Button
          onClick={onClick}
          className={`w-14 h-14 rounded-full shadow-lg transition-all duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <HelpCircle className="w-6 h-6" />
        </Button>

        {/* Notification Badge */}
        {hasNewSuggestions && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs animate-pulse"
          >
            <Sparkles className="w-3 h-3" />
          </Badge>
        )}

        {/* Tooltip */}
        {isHovered && (
          <div className="absolute bottom-16 right-0 bg-foreground text-background px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg animate-in fade-in-0 zoom-in-95">
            AI Help
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-foreground" />
          </div>
        )}

        {/* Pulse Animation */}
        <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
      </div>
    </div>
  )
}