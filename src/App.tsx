import { useMemo, useState } from "react";
import {
  computeMortgage,
  resolvePrincipal,
  type MortgageInputs,
} from "./lib/mortgage";
import { InputPanel } from "./components/InputPanel";
import { SummaryCards } from "./components/SummaryCards";
import { AmortizationChart } from "./components/AmortizationChart";
import { AmortizationTable } from "./components/AmortizationTable";
import { PawPrint } from "./components/icons";

const DEFAULTS: MortgageInputs = {
  price: 320000,
  savings: 70000,
  interestMode: "fija",
  fixedRate: 2.9,
  termYears: 30,
  netMonthlyIncome: 4200,
  otherMonthlyDebts: 150,
  purchaseCostsPct: 11,
  openingFeePct: 0,
  monthlyInsurance: 45,
};

export default function App() {
  const [inputs, setInputs] = useState<MortgageInputs>(DEFAULTS);

  const patch = (p: Partial<MortgageInputs>) =>
    setInputs((prev) => ({ ...prev, ...p }));

  const principal = resolvePrincipal(inputs);

  const { result, error } = useMemo(() => {
    try {
      return {
        result: computeMortgage(inputs),
        error: null as string | null,
      };
    } catch (e) {
      return { result: null, error: (e as Error).message };
    }
  }, [inputs]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      {/* Header con marca */}
      <header className="mb-6 flex items-center justify-between rounded-2xl border border-gold-300/40 bg-gradient-to-r from-white via-ice-50 to-gold-300/20 p-5 shadow-sm">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-extrabold text-ice-900 sm:text-2xl">
            <PawPrint className="h-6 w-6 text-caramel-500" />
            Martita's Dream: Pisazo en Boadilla
          </h1>
          <p className="mt-1 text-sm text-ice-500">
            Tu simulador de hipoteca — sin letra pequeña, con las cuentas claras. 🎿
          </p>
        </div>
        <span className="hidden h-9 w-9 items-center justify-center rounded-full bg-gold-300/40 text-lg sm:flex" title="Meta: el pisazo" aria-hidden="true">
          ⚽
        </span>
      </header>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700" role="alert">
          Revisa los datos: {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <InputPanel inputs={inputs} principal={principal} onChange={patch} />

        <div className="flex flex-col gap-5">
          {result && (
            <>
              <SummaryCards result={result} />
              <AmortizationChart schedule={result.schedule} />
              <AmortizationTable schedule={result.schedule} />
            </>
          )}
        </div>
      </div>

      <footer className="mt-8 text-center text-xs text-ice-400">
        Cálculos orientativos (sistema francés). No constituyen una oferta ni asesoramiento financiero.
      </footer>
    </div>
  );
}
