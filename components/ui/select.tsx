"use client";

import * as React from "react";

type SelectRootProps = {
  value: string;
  onValueChange: (val: string) => void;
  children: React.ReactNode;
  className?: string;
};

type ItemProps = { value: string; children: React.ReactNode };

const SelectItemCtx = React.createContext<ItemProps[] | null>(null);

function isReactElement(node: React.ReactNode): node is React.ReactElement {
  return typeof node === "object" && node !== null && "props" in (node as object);
}

function collectItems(node: React.ReactNode, out: ItemProps[] = []): ItemProps[] {
  React.Children.forEach(node, (child) => {
    if (!isReactElement(child)) return;

    const typeName =
      // @ts-expect-error runtime tag check
      child.type?.displayName || (child.type as { name?: string })?.name;

    if (typeName === "SelectItem") {
      const el = child as React.ReactElement<ItemProps>;
      out.push({ value: el.props.value, children: el.props.children });
    }

    const kids: unknown = child.props?.children;
    if (kids !== undefined) {
      collectItems(kids as React.ReactNode, out);
    }
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
      {/* Keep children mounted (hidden) so the API matches Radix-like composition */}
      <div className="hidden">{children}</div>
    </div>
  );
}
Select.displayName = "Select";

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

export function SelectItem({ value, children }: ItemProps) {
  // Only used for item collection in <Select />
  return <div data-value={value}>{children}</div>;
}
SelectItem.displayName = "SelectItem";
