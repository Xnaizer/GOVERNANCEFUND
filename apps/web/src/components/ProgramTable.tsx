import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Spinner } from "@heroui/react";
import { useNavigate } from "react-router-dom";
import type { ProgramListItem } from "../types/program";
import { StatusChip, IntegrityChip } from "./StatusChip";
import { formatIDR, formatShortenAddress } from "../utils/format";

export function ProgramTable({ programs, isLoading }: { programs: ProgramListItem[]; isLoading: boolean }) {
  const navigate = useNavigate();
  return (
    <Table aria-label="Programs" selectionMode="none" onRowAction={(key) => navigate(`/programs/${key}`)}>
      <TableHeader>
        <TableColumn>ID</TableColumn>
        <TableColumn>PROGRAM</TableColumn>
        <TableColumn>EXECUTOR</TableColumn>
        <TableColumn>BUDGET</TableColumn>
        <TableColumn>STATUS</TableColumn>
        <TableColumn>INTEGRITY</TableColumn>
      </TableHeader>
      <TableBody
        items={programs}
        isLoading={isLoading}
        loadingContent={<Spinner />}
        emptyContent="Tidak ada program di tab ini."
      >
        {(p) => (
          <TableRow key={p.programId} className="cursor-pointer">
            <TableCell>#{p.programId}</TableCell>
            <TableCell>{p.title ?? <span className="italic text-warning">orphan (no title)</span>}</TableCell>
            <TableCell>{p.executorName ?? formatShortenAddress(p.picWallet)}</TableCell>
            <TableCell className="font-mono text-sm">{formatIDR(p.totalBudget)}</TableCell>
            <TableCell><StatusChip status={p.status} /></TableCell>
            <TableCell><IntegrityChip integrity={p.integrity} /></TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
