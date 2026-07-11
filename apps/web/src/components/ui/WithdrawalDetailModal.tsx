import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { formatIDR, formatDate, formatShortenAddress } from "../../utils/format";
import type { Withdrawal } from "../../types/program";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase text-muted-foreground">{label}</span>
      <span className="break-all text-sm">{value ?? "—"}</span>
    </div>
  );
}

export function WithdrawalDetailModal({ w, isOpen, onClose }: { w: Withdrawal | null; isOpen: boolean; onClose: () => void }) {
  return (
    <Dialog open={isOpen} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Detail Penarikan</DialogTitle>
        </DialogHeader>
        {w && (
          <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pb-2">
            <div className="grid grid-cols-2 gap-4">
              <Row label="Jumlah" value={<span className="font-mono">{formatIDR(w.amount)}</span>} />
              <Row label="Tanggal" value={formatDate(w.timestamp)} />
              <Row label="Penerima" value={w.recipientName} />
              <Row
                label="Tx Hash"
                value={
                  w.txHash ? (
                    <a
                      href={`https://sepolia.basescan.org/tx/${w.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-brand-blue hover:underline"
                    >
                      {formatShortenAddress(w.txHash)}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <Row label="Deskripsi" value={w.description} />
            <div>
              <span className="text-xs uppercase text-muted-foreground">Bukti / Receipt</span>
              {w.receiptUrl ? (
                <a href={w.receiptUrl} target="_blank" rel="noreferrer" className="mt-1 block">
                  <img src={w.receiptUrl} alt="Receipt" className="max-h-72 rounded-lg border object-contain" loading="lazy" />
                </a>
              ) : (
                <Badge variant="secondary" className="mt-1">Belum ada foto receipt</Badge>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
