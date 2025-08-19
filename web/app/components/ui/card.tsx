import * as React from "react";

export const Card = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`rounded-xl border border-border bg-background ${className}`} {...props} />
);

export const CardHeader = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 border-b border-border-soft ${className}`} {...props} />
);

export const CardTitle = ({ className = "", ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={`text-base font-semibold leading-none tracking-tight ${className}`} {...props} />
);

export const CardContent = ({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={`p-4 ${className}`} {...props} />
);
