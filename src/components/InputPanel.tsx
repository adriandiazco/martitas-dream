import type { MortgageInputs, InterestMode } from "../lib/mortgage";
import { Card, Field, NumberInput } from "./ui";

interface Props {
  inputs: MortgageInputs;
  principal: number;
  onChange: (patch: Partial<MortgageInputs>) => void;
}

const modes: { value: InterestMode; label: string }[] = [
  { value: "fija", label: "Fija" },
  { value: "variable", label: "Variable" },
  { value: "mixta", label: "Mixta" },
];

export function InputPanel({ inputs, principal, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
      <Card title="Vivienda">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Precio de la vivienda" info="Precio de compra total de la vivienda, antes de impuestos y gastos.">
            <NumberInput value={inputs.price} step={1000} min={0} suffix="€" onChange={(v) => onChange({ price: v })} />
          </Field>
          <Field label="Ahorros disponibles" info="Dinero que aportas de tu bolsillo. Reduce el capital que necesitas financiar.">
            <NumberInput value={inputs.savings} step={1000} min={0} suffix="€" onChange={(v) => onChange({ savings: v })} />
          </Field>
          <Field label="Gastos e impuestos de compra" info="ITP/IVA, notaría, registro, gestoría y tasación. Suele rondar el 10-12% del precio.">
            <NumberInput value={inputs.purchaseCostsPct} step={0.5} min={0} suffix="%" onChange={(v) => onChange({ purchaseCostsPct: v })} />
          </Field>
          <Field label="Capital a financiar" info="Por defecto es precio − ahorros. Puedes forzarlo a mano si quieres pedir más o menos hipoteca.">
            <NumberInput
              value={inputs.principal ?? principal}
              step={1000}
              min={0}
              suffix="€"
              onChange={(v) => onChange({ principal: v })}
            />
          </Field>
        </div>
      </Card>

      <Card title="Financiación">
        <div className="mb-3 flex gap-2">
          {modes.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onChange({ interestMode: m.value })}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition ${
                inputs.interestMode === m.value
                  ? "border-gold-400 bg-gold-300/30 text-ice-800"
                  : "border-ice-200 bg-white text-ice-500 hover:bg-ice-50"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {inputs.interestMode === "fija" && (
            <Field label="TIN" info="Tipo de Interés Nominal: el interés puro del préstamo, sin comisiones ni gastos.">
              <NumberInput value={inputs.fixedRate ?? 0} step={0.1} min={0} suffix="%" onChange={(v) => onChange({ fixedRate: v })} />
            </Field>
          )}
          {(inputs.interestMode === "variable" || inputs.interestMode === "mixta") && (
            <>
              <Field label="Euríbor actual" info="Índice de referencia europeo. Tu cuota variable = Euríbor + diferencial.">
                <NumberInput value={inputs.euribor ?? 0} step={0.1} suffix="%" onChange={(v) => onChange({ euribor: v })} />
              </Field>
              <Field label="Diferencial" info="Puntos que el banco suma al Euríbor de forma fija durante toda la vida del préstamo.">
                <NumberInput value={inputs.spread ?? 0} step={0.1} min={0} suffix="%" onChange={(v) => onChange({ spread: v })} />
              </Field>
            </>
          )}
          {inputs.interestMode === "mixta" && (
            <Field label="TIN tramo fijo" info="Interés fijo aplicado durante los primeros años antes de pasar a variable.">
              <NumberInput value={inputs.fixedRate ?? 0} step={0.1} min={0} suffix="%" onChange={(v) => onChange({ fixedRate: v })} />
            </Field>
          )}
          <Field label="Plazo" info="Años en los que devolverás el préstamo. A más plazo, menor cuota pero más intereses totales.">
            <NumberInput value={inputs.termYears} step={1} min={1} suffix="años" onChange={(v) => onChange({ termYears: v })} />
          </Field>
          <Field label="Comisión de apertura" info="Comisión inicial que cobra el banco al conceder la hipoteca, como % del capital.">
            <NumberInput value={inputs.openingFeePct ?? 0} step={0.1} min={0} suffix="%" onChange={(v) => onChange({ openingFeePct: v })} />
          </Field>
          <Field label="Seguros vinculados / mes" info="Seguros de vida y hogar que suele exigir el banco. Se suman a tu cuota mensual.">
            <NumberInput value={inputs.monthlyInsurance ?? 0} step={5} min={0} suffix="€" onChange={(v) => onChange({ monthlyInsurance: v })} />
          </Field>
        </div>
      </Card>

      <Card title="Situación personal">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Ingresos netos del hogar / mes" info="Suma de los ingresos netos mensuales de quienes firman la hipoteca.">
            <NumberInput value={inputs.netMonthlyIncome} step={100} min={0} suffix="€" onChange={(v) => onChange({ netMonthlyIncome: v })} />
          </Field>
          <Field label="Otras deudas fijas / mes" info="Préstamos de coche, personales, etc. Cuentan para el ratio de esfuerzo.">
            <NumberInput value={inputs.otherMonthlyDebts} step={50} min={0} suffix="€" onChange={(v) => onChange({ otherMonthlyDebts: v })} />
          </Field>
        </div>
      </Card>
    </div>
  );
}
