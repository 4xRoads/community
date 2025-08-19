import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

interface ComingSoonCardProps {
  title: string
  description: string
  icon: React.ReactNode
  features?: string[]
}

export function ComingSoonCard({ title, description, icon, features }: ComingSoonCardProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-2 border-dashed border-border">
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 bg-surface-2 rounded-full flex items-center justify-center mx-auto mb-6">
            {icon}
          </div>
          <h2 className="text-2xl font-semibold mb-3">{title}</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
          
          {features && features.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">Planned Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-left">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button variant="outline" disabled>
            Coming Soon
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
