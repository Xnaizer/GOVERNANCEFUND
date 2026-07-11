import { useNavigate } from "react-router-dom";
import { Image as ImageIcon } from "lucide-react";
import type { ProgramListItem } from "../types/program";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip, IntegrityChip } from "./StatusChip";
import { formatIDR, formatShortenAddress } from "../utils/format";

function initials(s: string): string {
  return s.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("") || "?";
}

export function ProgramBento({ programs, isLoading }: { programs: ProgramListItem[]; isLoading: boolean }) {
  const navigate = useNavigate();

  if (isLoading) {
    return <div className="flex justify-center py-16"><Spinner /></div>;
  }
  if (programs.length === 0) {
    return <p className="py-16 text-center text-muted-foreground">Tidak ada program di tab ini.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {programs.map((p) => {
        const cover = p.programURLs?.[0];
        const picLabel = p.pic?.name ?? p.executorName ?? "?";
        return (
          <Card
            key={p.programId}
            onClick={() => navigate(`/programs/${p.programId}`)}
            className="h-full cursor-pointer overflow-hidden pt-0 transition-transform hover:-translate-y-0.5 hover:shadow-md"
          >
            {/* Cover */}
            <div className="relative h-36 w-full overflow-hidden bg-linear-to-br from-brand-mint/30 to-brand-blue/30">
              {cover ? (
                <img src={cover} alt={p.title ?? `program ${p.programId}`} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-brand-blue/40">
                  <ImageIcon className="h-8 w-8" />
                </div>
              )}
              <div className="absolute left-2 top-2 flex gap-1">
                <StatusChip status={p.status} />
              </div>
              <span className="absolute right-2 top-2 rounded-md bg-black/55 px-2 py-0.5 font-mono text-[11px] text-white">#{p.programId}</span>
            </div>

            <CardContent className="flex flex-col gap-1 p-4 pb-2">
              <p className="line-clamp-1 font-semibold">
                {p.title ?? <span className="italic text-amber-600">orphan (no title)</span>}
              </p>
              <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                {p.category && <Badge variant="secondary" className="h-5">{p.category}</Badge>}
                {p.regency && <span className="truncate">{p.regency}</span>}
              </div>
              <p className="mt-1 font-mono text-sm font-semibold text-brand-blue">{formatIDR(p.totalBudget)}</p>
            </CardContent>

            <CardFooter className="justify-between gap-2 border-t p-4 pt-2">
              <div className="flex min-w-0 items-center gap-2">
                <Avatar className="h-6 w-6 shrink-0 text-[10px]">
                  {p.pic?.profilePictureURL && <AvatarImage src={p.pic.profilePictureURL} alt={picLabel} />}
                  <AvatarFallback>{initials(picLabel)}</AvatarFallback>
                </Avatar>
                <span className="truncate text-xs text-muted-foreground">
                  {p.pic?.name ?? p.executorName ?? formatShortenAddress(p.picWallet)}
                </span>
              </div>
              <IntegrityChip integrity={p.integrity} />
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
