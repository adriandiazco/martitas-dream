import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { AmortizationRow } from "../lib/mortgage";
import { Card, eur } from "./ui";

export function AmortizationChart({ schedule }: { schedule: AmortizationRow[] }) {
  const data = useMemo(() => {
    let interestAcc = 0;
    // Muestreo: si hay muchos meses, tomamos ~120 puntos para fluidez.
    const stride = Math.max(1, Math.floor(schedule.length / 120));
    const out: { year: number; pendiente: number; interesesAcum: number }[] = [];
    schedule.forEach((r, i) => {
      interestAcc += r.interest;
      if (i % stride === 0 || i === schedule.length - 1) {
        out.push({
          year: Math.round((r.month / 12) * 10) / 10,
          pendiente: r.remainingBalance,
          interesesAcum: Math.round(interestAcc * 100) / 100,
        });
      }
    });
    return out;
  }, [schedule]);

  return (
    <Card title="Evolución del préstamo">
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gPend" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4b7ea9" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#4b7ea9" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="gInt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#c9a24b" stopOpacity={0.5} />
                <stop offset="100%" stopColor="#c9a24b" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e3edf6" />
            <XAxis dataKey="year" tickFormatter={(v) => `${v}a`} fontSize={12} stroke="#6f9dc3" />
            <YAxis tickFormatter={(v) => `${Math.round(v / 1000)}k`} fontSize={12} stroke="#6f9dc3" width={44} />
            <Tooltip
              formatter={(v: number) => eur(v)}
              labelFormatter={(l) => `Año ${l}`}
            />
            <Legend />
            <Area type="monotone" dataKey="pendiente" name="Capital pendiente" stroke="#4b7ea9" fill="url(#gPend)" strokeWidth={2} />
            <Area type="monotone" dataKey="interesesAcum" name="Intereses acumulados" stroke="#c9a24b" fill="url(#gInt)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
