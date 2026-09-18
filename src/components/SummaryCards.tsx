import { useEffect, useRef } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import type { MortgageResult } from "../lib/mortgage";
import { Card, eur, eur2, pct } from "./ui";
import { PawPrint } from "./icons";

const COLORS = {
  green: "#3f9a6a",
  amber: "#c9a24b",
  red: "#c0563f",
};

function effortColor(r: MortgageResult["effort"]) {
  if (r.danger) return COLORS.red;
  if (r.warning) return COLORS.amber;
  return COLORS.green;
}

export function SummaryCards({ result }: { result: MortgageResult }) {
  const green = !result.effort.warning;
  const glowRef = useRef<HTMLDivElement>(null);
  const wasGreen = useRef(false);

  // Micro-interacción: iluminado suave al PASAR a verde (meta cumplida).
  useEffect(() => {
    if (green && !wasGreen.current && glowRef.current) {
      const el = glowRef.current;
      el.classList.remove("goal-reached");
      void el.offsetWidth; // reflow
      el.classList.add("goal-reached");
    }
    wasGreen.current = green;
  }, [green]);

  const monthlyTotal =
    result.monthlyPayment +
    (result.totalInsurance > 0 && result.actualMonths > 0
      ? result.totalInsurance / result.actualMonths
      : 0);

  const pieData = [
    { name: "Capital", value: result.principal },
    { name: "Intereses", value: result.totalInterest },
    { name: "Gastos de compra", value: result.purchaseCosts + result.openingFee },
    { name: "Seguros", value: result.totalInsurance },
  ].filter((d) => d.value > 0);

  const pieColors = ["#4b7ea9", "#c9a24b", "#a86d33", "#a3c1da"];
  const color = effortColor(result.effort);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Cuota mensual destacada */}
        <div
          ref={glowRef}
          className="rounded-2xl border border-ice-100 bg-gradient-to-br from-white to-ice-50 p-5 shadow-sm"
        >
          <p className="text-sm font-medium uppercase tracking-wide text-ice-400">
            Cuota mensual
          </p>
          <p className="tnum mt-1 text-4xl font-extrabold text-ice-900">
            {eur2(result.monthlyPayment)}
          </p>
          {result.totalInsurance > 0 && (
            <p className="tnum mt-1 text-sm text-ice-500">
              {eur2(monthlyTotal)} con seguros incluidos
            </p>
          )}
          <p className="mt-2 text-xs text-ice-400">
            TAE aprox. <strong className="tnum text-ice-600">{result.aprApprox}%</strong>
          </p>
        </div>

        {/* Ratio de esfuerzo con semáforo */}
        <div
          className="flex flex-col justify-between rounded-2xl border p-5 shadow-sm"
          style={{ borderColor: color + "55", background: color + "12" }}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium uppercase tracking-wide text-ice-400">
              Ratio de esfuerzo
            </p>
            <span
              className="h-3 w-3 rounded-full"
              style={{ background: color }}
              aria-hidden="true"
            />
          </div>
          <p className="tnum mt-1 text-4xl font-extrabold" style={{ color }}>
            {pct(result.effort.ratio)}
          </p>
          <p className="mt-2 flex items-center gap-1.5 text-sm font-medium" style={{ color }}>
            {green && <PawPrint className="h-4 w-4" />}
            {result.effort.danger
              ? "Riesgo alto: supera el 40%"
              : result.effort.warning
              ? "Ajustado: entre 35% y 40%"
              : "Cuota bajo control"}
          </p>
        </div>
      </div>

      {/* Desglose del coste total (donut) */}
      <Card title="Desglose del coste total de la operación">
        <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[1fr_1fr]">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => eur(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex justify-between"><span className="text-ice-500">Coste total operación</span><strong className="tnum">{eur(result.totalOperationCost)}</strong></li>
            <li className="flex justify-between"><span className="text-ice-500">Intereses totales</span><strong className="tnum">{eur(result.totalInterest)}</strong></li>
            <li className="flex justify-between"><span className="text-ice-500">Gastos de compra</span><strong className="tnum">{eur(result.purchaseCosts)}</strong></li>
            {result.openingFee > 0 && <li className="flex justify-between"><span className="text-ice-500">Comisión apertura</span><strong className="tnum">{eur(result.openingFee)}</strong></li>}
            {result.totalInsurance > 0 && <li className="flex justify-between"><span className="text-ice-500">Seguros (total)</span><strong className="tnum">{eur(result.totalInsurance)}</strong></li>}
          </ul>
        </div>
      </Card>
    </div>
  );
}
