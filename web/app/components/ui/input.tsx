import * as React from "react";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className = "", ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none ring-0 placeholder:text-muted-foreground focus:border-primary ${className}`}
      {...props}
    />
  );
});
Input.displayName = "Input";
