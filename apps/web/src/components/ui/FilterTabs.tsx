import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function FilterTabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
}) {
  return (
    <Tabs
      value={value}
      onValueChange={(v) => onChange(v as T)}
      className={className}
    >
      <TabsList className="h-auto flex-wrap gap-1 rounded-xl bg-muted/60 p-1">
        {items.map((it) => (
          <TabsTrigger
            key={it.key}
            value={it.key}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors data-[state=active]:bg-background data-[state=active]:text-brand-blue data-[state=active]:shadow-sm"
          >
            {it.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
