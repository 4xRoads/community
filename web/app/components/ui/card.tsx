export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border rounded p-4 ${className}`}>{children}</div>;
}
export function CardContent({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
export function CardHeader({ children }: { children: React.ReactNode }) { return <div>{children}</div>; }
export function CardTitle({ children }: { children: React.ReactNode }) { return <h3>{children}</h3>; }
