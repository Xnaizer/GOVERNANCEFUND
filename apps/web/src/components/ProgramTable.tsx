import { useNavigate } from "react-router-dom";
import type { ProgramListItem } from "../types/program";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { StatusChip, IntegrityChip } from "./StatusChip";
import { formatIDR, formatShortenAddress } from "../utils/format";

export function ProgramTable({ programs, isLoading }: { programs: ProgramListItem[]; isLoading: boolean }) {
  const navigate = useNavigate();
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>PROGRAM</TableHead>
          <TableHead>EXECUTOR</TableHead>
          <TableHead>BUDGET</TableHead>
          <TableHead>STATUS</TableHead>
          <TableHead>INTEGRITY</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center"><Spinner /></TableCell>
          </TableRow>
        ) : programs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Tidak ada program di tab ini.</TableCell>
          </TableRow>
        ) : (
          programs.map((p) => (
            <TableRow key={p.programId} className="cursor-pointer" onClick={() => navigate(`/programs/${p.programId}`)}>
              <TableCell>#{p.programId}</TableCell>
              <TableCell>{p.title ?? <span className="italic text-amber-600">orphan (no title)</span>}</TableCell>
              <TableCell>{p.executorName ?? formatShortenAddress(p.picWallet)}</TableCell>
              <TableCell className="font-mono text-sm">{formatIDR(p.totalBudget)}</TableCell>
              <TableCell><StatusChip status={p.status} /></TableCell>
              <TableCell><IntegrityChip integrity={p.integrity} /></TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
