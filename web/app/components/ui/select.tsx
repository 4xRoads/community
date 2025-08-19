"use client";

import * as React from "react";

/** Root props for our simple Select */
type SelectRootProps = {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
};

/** Props for an item child */
type ItemProps = { value: string; children: React.ReactNode };

/** We detect our own child component by reference */
const SelectItemComponent: React.FC<ItemProps> = (__props) => null;
SelectItemComponent.displayName = "SelectItem";

/** Collect <SelectItem> children safely with proper typing */
function collectItems(node: React.ReactNode, out: ItemProps[] = []): ItemProps[] {
  React.Children.forEach(node, (child) => {
    if (!child) return;
    if (React.isValidElement(child)) {
      if (child.type === SelectItemComponent) {
        const el = child as React.ReactElement<ItemProps>;
        out.push({ value: el.props.value, children: el.props.children });
      }
      // Safely access children with proper typing
      const childProps = child.props as Record<string, unknown>;
      const kids = childProps.children as React.ReactNode;
      if (kids) collectItems(kids, out);
    }
  });
  return out;
}

/** Root */
export function Select({ value, onValueChange, children, className = "" }: SelectRootProps) {
  const items = collectItems(children);
  return (
    <div className={className}>
      <select
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:border-primary"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {items.map((it) => (
          <option key={it.value} value={it.value}>
            {typeof it.children === "string" ? it.children : it.value}
          </option>
        ))}
      </select>
      {/* Keep children in tree (hidden) so API stays compatible */}
      <div className="hidden">{children}</div>
    </div>
  );
}
Select.displayName = "Select";

/** Structural shells (kept for API parity with your existing imports) */
export function SelectTrigger({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-sm text-muted-foreground">{placeholder}</span>;
}
SelectValue.displayName = "SelectValue";

export function SelectContent({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
SelectContent.displayName = "SelectContent";

/** Exported item component that the collector recognizes */
export function SelectItem({ value, children }: ItemProps) {
  // Render nothing; only used for metadata collection
  return <SelectItemComponent value={value}>{children}</SelectItemComponent>;
}
SelectItem.displayName = "SelectItem";
