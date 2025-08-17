import { useState, useRef, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { ScrollArea } from './ui/scroll-area'
import { 
  X, 
  HelpCircle, 
  Send, 
  Bot,
  User,
  ExternalLink,
  Clock,
  AlertTriangle,
  CheckCircle,
  Search,
  BarChart3,
  Users,
  Route,
  MessageSquare
} from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  citations?: Array<{
    id: string
    type: 'ticket' | 'shift' | 'driver' | 'route'
    title: string
    count?: number
  }>
  actions?: Array<{
    label: string
    action: () => void
  }>
}

interface AIHelpPanelProps {
  isOpen: boolean
  onClose: () => void
  onNavigate: (view: string, filters?: any) => void
  tickets: any[]
  shifts: any[]
  drivers: any[]
}

export function AIHelpPanel({ isOpen, onClose, onNavigate, tickets, shifts, drivers }: AIHelpPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI assistant. I can help you understand the platform, find information, and navigate to different sections. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const generateResponse = (userQuery: string): Omit<ChatMessage, 'id' | 'timestamp'> => {
    const query = userQuery.toLowerCase()

    // Overdue tickets query
    if (query.includes('overdue') && query.includes('ticket')) {
      const overdueTickets = tickets.filter(ticket => {
        const today = new Date()
        const expectedDate = new Date(ticket.expectedResolutionDate)
        return expectedDate < today && ticket.status !== 'Closed'
      })

      return {
        type: 'assistant',
        content: `I found ${overdueTickets.length} overdue tickets. Here are the details:`,
        citations: overdueTickets.slice(0, 5).map(ticket => ({
          id: ticket.id,
          type: 'ticket',
          title: `${ticket.id} - ${ticket.customer} (${ticket.category})`
        })),
        actions: [
          {
            label: 'View All Overdue Tickets',
            action: () => onNavigate('customer-requests', { showOverdueOnly: true })
          }
        ]
      }
    }

    // Show tickets query
    if (query.includes('show') && query.includes('ticket')) {
      return {
        type: 'assistant',
        content: `Here are your recent tickets (${tickets.length} total):`,
        citations: tickets.slice(0, 5).map(ticket => ({
          id: ticket.id,
          type: 'ticket',
          title: `${ticket.id} - ${ticket.customer} (${ticket.status})`
        })),
        actions: [
          {
            label: 'Go to Customer Requests',
            action: () => onNavigate('customer-requests')
          }
        ]
      }
    }

    // Route Planning explanation
    if (query.includes('route planning') || query.includes('route')) {
      return {
        type: 'assistant',
        content: "Route Planning is a powerful feature that helps optimize delivery routes for maximum efficiency. It's currently in development and will include:",
        actions: [
          {
            label: 'View Route Planning',
            action: () => onNavigate('route-planning')
          }
        ]
      }
    }

    // Dashboard explanation
    if (query.includes('dashboard')) {
      return {
        type: 'assistant',
        content: "The Dashboard provides a comprehensive overview of your operations with real-time metrics and insights. It's coming soon and will feature key performance indicators, analytics, and customizable widgets.",
        actions: [
          {
            label: 'Go to Dashboard',
            action: () => onNavigate('dashboard')
          }
        ]
      }
    }

    // CRM explanation
    if (query.includes('crm') || query.includes('customer relationship')) {
      return {
        type: 'assistant',
        content: "CRM (Customer Relationship Management) helps you manage customer relationships, track interactions, and grow your business. This feature is coming soon and will include customer profiles, interaction history, and communication tools.",
        actions: [
          {
            label: 'View CRM',
            action: () => onNavigate('crm')
          }
        ]
      }
    }

    // Driver schedule info
    if (query.includes('schedule') || query.includes('driver')) {
      return {
        type: 'assistant',
        content: `The Driver Schedule shows all shifts organized by date. You currently have ${shifts.length} shifts and ${drivers.length} drivers. Shifts can be color-coded by status: blue for scheduled, green for confirmed, red for call-offs.`,
        citations: shifts.slice(0, 3).map(shift => ({
          id: shift.id,
          type: 'shift',
          title: `${shift.driver} - ${shift.route} (${shift.status})`
        })),
        actions: [
          {
            label: 'Go to Driver Schedule',
            action: () => onNavigate('driver-schedule')
          }
        ]
      }
    }

    // Tickets by status
    if (query.includes('status') && query.includes('ticket')) {
      const statusCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.status] = (acc[ticket.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      const statusText = Object.entries(statusCounts)
        .map(([status, count]) => `${count} ${status}`)
        .join(', ')

      return {
        type: 'assistant',
        content: `Here's your ticket breakdown by status: ${statusText}`,
        citations: (Object.entries(statusCounts) as [string, number][])
          .map(([status, count]) => ({
            id: status,
            type: 'ticket',
            title: `${status} Tickets`,
            count,
          })),
        actions: [
          {
            label: 'View All Tickets',
            action: () => onNavigate('customer-requests')
          }
        ]
      }
    }

    // Help with navigation
    if (query.includes('navigate') || query.includes('go to') || query.includes('take me')) {
      return {
        type: 'assistant',
        content: "I can help you navigate to different sections of the platform:",
        actions: [
          { label: 'Dashboard', action: () => onNavigate('dashboard') },
          { label: 'Customer Requests', action: () => onNavigate('customer-requests') },
          { label: 'Driver Schedule', action: () => onNavigate('driver-schedule') },
          { label: 'Settings', action: () => onNavigate('settings') }
        ]
      }
    }

    // Default response
    return {
      type: 'assistant',
      content: "I can help you with:\n• Finding and filtering tickets\n• Understanding platform features\n• Navigating to different sections\n• Explaining coming soon features\n• Providing data summaries\n\nTry asking about overdue tickets, driver schedules, or specific features!"
    }
  }

  const handleSend = () => {
    if (!input.trim() || isProcessing) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsProcessing(true)

    // Simulate processing delay
    setTimeout(() => {
      const response = generateResponse(input)
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date(),
        ...response
      }

      setMessages(prev => [...prev, assistantMessage])
      setIsProcessing(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-background border-l border-border-soft shadow-lg z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-soft">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-medium">AI Help</h3>
            <p className="text-xs text-muted-foreground">Ask about any data or screen</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] space-y-2 ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                <div className={`flex items-center space-x-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.type === 'assistant' && (
                    <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                      <Bot className="w-3 h-3 text-primary" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {message.type === 'user' && (
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center">
                      <User className="w-3 h-3" />
                    </div>
                  )}
                </div>

                <Card className={`p-3 ${message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted/50'}`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </Card>

                {/* Citations */}
                {message.citations && message.citations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">References:</p>
                    <div className="grid gap-2">
                      {message.citations.map((citation) => (
                        <Card key={citation.id} className="p-2 hover:bg-muted/50 cursor-pointer transition-colors">
                          <div className="flex items-center space-x-2">
                            {citation.type === 'ticket' && <MessageSquare className="w-3 h-3 text-muted-foreground" />}
                            {citation.type === 'shift' && <Clock className="w-3 h-3 text-muted-foreground" />}
                            {citation.type === 'driver' && <User className="w-3 h-3 text-muted-foreground" />}
                            {citation.type === 'route' && <Route className="w-3 h-3 text-muted-foreground" />}
                            <span className="text-xs">{citation.title}</span>
                            {citation.count && (
                              <Badge variant="secondary" className="text-xs">
                                {citation.count}
                              </Badge>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                {message.actions && message.actions.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {message.actions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={action.action}
                          className="text-xs"
                        >
                          {action.label}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                    <Bot className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-xs text-muted-foreground">Thinking...</span>
                </div>
                <Card className="p-3 mt-2 bg-muted/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border-soft">
        <div className="flex space-x-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about tickets, schedules, features..."
            disabled={isProcessing}
          />
          <Button onClick={handleSend} disabled={!input.trim() || isProcessing}>
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try: "show me overdue tickets" or "what is Route Planning?"
        </p>
      </div>
    </div>
  )
}
