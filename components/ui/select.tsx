// src/components/ui/select.tsx
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

// A narrow definition for "React element with children"
type ElementWithChildren = React.ReactElement<{ children?: React.ReactNode }>;

function isElementWithChildren(node: unknown): node is ElementWithChildren {
  return Boolean(
    node &&
      typeof node === "object" &&
      // @ts-expect-error -- runtime check
      "props" in node
  );
}

function collectItems(node: React.ReactNode, out: ItemProps[] = []): ItemProps[] {
  React.Children.forEach(node, (child) => {
    if (!child || typeof child !== "object") return;

    // We need runtime tag name to detect <SelectItem />
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error runtime tag check
    const typeName: string | undefined = child.type?.displayName ?? child.type?.name;

    if (typeName === "SelectItem") {
      const el = child as React.ReactElement<ItemProps>;
      out.push({ value: el.props.value, children: el.props.children });
    }

    if (isElementWithChildren(child) && child.props?.children) {
      collectItems(child.props.children, out);
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

      {/* Render children invisibly so JSX tree stays compatible (no layout impact) */}
      <div className="hidden">{children}</div>
    </div>
  );
}
Select.displayName = "Select";

export function SelectTrigger({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
SelectTrigger.displayName = "SelectTrigger";

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <span className="text-sm text-muted-foreground">{placeholder}</span>;
}
SelectValue.displayName = "SelectValue";

export function SelectContent({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />;
}
SelectContent.displayName = "SelectContent";

export function SelectItem({ value, children }: ItemProps) {
  // Only used for item collection in <Select />
  return <div data-value={value}>{children}</div>;
}
SelectItem.displayName = "SelectItem";
