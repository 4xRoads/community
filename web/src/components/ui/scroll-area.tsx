import * as React from "react";

export function ScrollArea({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`overflow-auto [scrollbar-width:thin] ${className}`} {...props} />;
}
