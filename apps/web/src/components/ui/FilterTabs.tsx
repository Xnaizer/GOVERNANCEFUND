import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/** Deret tab sebagai pemilih filter (bukan panel konten). */
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
    <Tabs value={value} onValueChange={(v) => onChange(v as T)} className={className}>
      <TabsList className="h-auto flex-wrap">
        {items.map((it) => (
          <TabsTrigger key={it.key} value={it.key}>{it.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
