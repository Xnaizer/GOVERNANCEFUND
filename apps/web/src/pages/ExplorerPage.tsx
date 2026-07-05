import { useState } from "react";
import { Tabs, Tab } from "@heroui/react";
import { PublicHeader } from "../components/layout/PublicHeader";
import { StatsBar } from "../components/StatsBar";
import { ProgramTable } from "../components/ProgramTable";
import { usePrograms } from "../hooks/usePrograms";
import type { DisplayTab } from "../types/common";

const TABS: { key: DisplayTab; label: string }[] = [
  { key: "ACTIVE", label: "Active" },
  { key: "FINISHED", label: "Finished" },
  { key: "FLAGGED", label: "Flagged" },
  { key: "FRAUD", label: "Fraud" },
];

export function ExplorerPage() {
  const [tab, setTab] = useState<DisplayTab>("ACTIVE");
  const { data, isLoading } = usePrograms(tab);

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <div>
          <h1 className="text-3xl font-bold">Public Budget Explorer</h1>
          <p className="text-default-500">Pantau sirkulasi dana publik secara transparan.</p>
        </div>

        <StatsBar />

        <Tabs
          aria-label="Program tabs"
          selectedKey={tab}
          onSelectionChange={(k) => setTab(k as DisplayTab)}
          color="primary"
        >
          {TABS.map((t) => <Tab key={t.key} title={t.label} />)}
        </Tabs>

        <ProgramTable programs={data?.programs ?? []} isLoading={isLoading} />
      </main>
    </div>
  );
}
