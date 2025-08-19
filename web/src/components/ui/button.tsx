import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md";
};

const base =
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<Props["variant"]>, string> = {
  default: "bg-primary text-primary-foreground hover:opacity-90 px-4 py-2",
  outline: "border border-border px-4 py-2 hover:bg-muted/50",
  ghost: "px-2 py-1 hover:bg-muted/50",
  destructive: "bg-red-600 text-white hover:bg-red-700 px-4 py-2",
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-8 text-sm",
  md: "h-10 text-sm",
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ className = "", variant = "default", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
