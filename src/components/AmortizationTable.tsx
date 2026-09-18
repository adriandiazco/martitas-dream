import { useState } from "react";
import type { AmortizationRow } from "../lib/mortgage";
import { scheduleToCSV } from "../lib/mortgage";
import { Card, eur2 } from "./ui";

const PAGE = 12;

export function AmortizationTable({ schedule }: { schedule: AmortizationRow[] }) {
  const [open, setOpen] = useState(true);
  const [page, setPage] = useState(0);

  const pages = Math.ceil(schedule.length / PAGE);
  const safePage = Math.min(page, Math.max(0, pages - 1));
  const rows = schedule.slice(safePage * PAGE, safePage * PAGE + PAGE);

  const exportCSV = () => {
    const blob = new Blob([scheduleToCSV(schedule)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cuadro_amortizacion.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-ice-500">
          Cuadro de amortización · {schedule.length} meses
        </h3>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="rounded-lg border border-ice-200 px-3 py-1.5 text-sm text-ice-600 hover:bg-ice-50">
            Exportar CSV
          </button>
          <button onClick={() => setOpen((v) => !v)} className="rounded-lg border border-ice-200 px-3 py-1.5 text-sm text-ice-600 hover:bg-ice-50">
            {open ? "Colapsar" : "Expandir"}
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="max-h-80 overflow-auto rounded-lg border border-ice-100">
            <table className="tnum w-full min-w-[520px] text-right text-sm">
              <thead className="sticky top-0 bg-ice-50 text-xs uppercase text-ice-500">
                <tr>
                  <th className="px-3 py-2 text-left">Mes</th>
                  <th className="px-3 py-2">Cuota</th>
                  <th className="px-3 py-2">Interés</th>
                  <th className="px-3 py-2">Capital</th>
                  <th className="px-3 py-2">Pendiente</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.month} className="border-t border-ice-50 hover:bg-ice-50/50">
                    <td className="px-3 py-1.5 text-left text-ice-500">{r.month}</td>
                    <td className="px-3 py-1.5">{eur2(r.payment)}</td>
                    <td className="px-3 py-1.5 text-gold-600">{eur2(r.interest)}</td>
                    <td className="px-3 py-1.5 text-ice-700">{eur2(r.principalPaid)}</td>
                    <td className="px-3 py-1.5 font-medium">{eur2(r.remainingBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-ice-500">
              <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={safePage === 0} className="rounded-lg border border-ice-200 px-3 py-1 disabled:opacity-40">
                ← Anterior
              </button>
              <span>Página {safePage + 1} / {pages}</span>
              <button onClick={() => setPage((p) => Math.min(pages - 1, p + 1))} disabled={safePage >= pages - 1} className="rounded-lg border border-ice-200 px-3 py-1 disabled:opacity-40">
                Siguiente →
              </button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
