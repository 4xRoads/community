# Overwrite the existing badge.tsx with the corrected version that accepts variant
@"
import * as React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  const baseClasses = "inline-flex items-center rounded-md border px-2 py-0.5 text-xs";
  
  const variantClasses = {
    default: "bg-primary text-primary-foreground border-transparent",
    secondary: "bg-secondary text-secondary-foreground border-transparent", 
    destructive: "bg-red-600 text-white border-transparent",
    outline: "border-input bg-background text-foreground"
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
"@ | Out-File -FilePath "web\app\components\ui\badge.tsx" -Encoding UTF8 -Force