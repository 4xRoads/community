export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border rounded p-4 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: { children: React.ReactNode; className?: string }) { 
  return <div className={className}>{children}</div>; 
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) { 
  return <div className={className}>{children}</div>; 
}

export function CardTitle({ children, className = "" }: { children: React.ReactNode; className?: string }) { 
  return <h3 className={className}>{children}</h3>; 
}
