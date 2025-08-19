"use client";
import * as React from "react";

type SelectRootProps = {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
};

type ItemProps = { value: string; children: React.ReactNode };

function collectItems(node: React.ReactNode, out: ItemProps[] = []): ItemProps[] {
  React.Children.forEach(node, (child) => {
    if (!child || typeof child !== "object") return;
    // @ts-expect-error runtime tag check
    const type = child.type?.displayName || child.type?.name;
    if (type === "SelectItem") {
      const el = child as React.ReactElement<ItemProps>;
      out.push({ value: el.props.value, children: el.props.children });
    }
    // @ts-expect-error children
    const kids = (child as any).props?.children;
    if (kids) collectItems(kids, out);
  });
  return out;
}

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
      {/* keep children for API compatibility, but hidden */}
      <div className="hidden">{children}</div>
    </div>
  );
}
Select.displayName = "Select";

export function SelectTrigger(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-sm text-muted-foreground">{placeholder}</span>;
}
SelectValue.displayName = "SelectValue";

export function SelectContent(props: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...props} />;
}
SelectContent.displayName = "SelectContent";

export function SelectItem({ value, children }: ItemProps) {
  return <div data-value={value}>{children}</div>;
}
SelectItem.displayName = "SelectItem";
