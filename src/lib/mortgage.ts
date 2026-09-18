// ===========================================================================
// Martita's Dream: Pisazo en Boadilla
// Lógica financiera pura (sistema de amortización francés). Sin dependencias
// de UI. Todo tipado estricto.
// ===========================================================================

export type InterestMode = "fija" | "variable" | "mixta";

export interface MortgageInputs {
  /** Precio de la vivienda (€). */
  price: number;
  /** Ahorros disponibles (€). */
  savings: number;
  /**
   * Capital a financiar (€). Si es undefined se calcula como price - savings.
   * Editable a mano para forzarlo.
   */
  principal?: number;

  interestMode: InterestMode;
  /** TIN anual (%) para modalidad fija (o tramo fijo de la mixta). */
  fixedRate?: number;
  /** Euríbor actual (%) para modalidad variable (o tramo variable de la mixta). */
  euribor?: number;
  /** Diferencial (%) sobre el euríbor en modalidad variable/mixta. */
  spread?: number;
  /** Años del tramo fijo en modalidad mixta. */
  mixedFixedYears?: number;

  /** Plazo de amortización en años. */
  termYears: number;

  /** Ingresos netos mensuales del hogar (€). */
  netMonthlyIncome: number;
  /** Otras deudas / gastos fijos mensuales (€). */
  otherMonthlyDebts: number;

  /** Gastos e impuestos de compra como % del precio (por defecto 10-12%). */
  purchaseCostsPct: number;
  /** Comisión de apertura como % del capital (opcional). */
  openingFeePct?: number;
  /** Seguros vinculados obligatorios (vida + hogar) en € mensuales (opcional). */
  monthlyInsurance?: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  interest: number;
  principalPaid: number;
  remainingBalance: number;
}

export interface EffortRatio {
  ratio: number; // 0..1
  warning: boolean; // > 35%
  danger: boolean; // > 40%
}

export interface MortgageResult {
  principal: number;
  monthlyRate: number;
  /** Cuota mensual base del sistema francés (sin seguros). */
  monthlyPayment: number;
  schedule: AmortizationRow[];
  /** Nº de meses hasta saldar el préstamo. */
  actualMonths: number;
  /** Intereses totales pagados. */
  totalInterest: number;
  purchaseCosts: number;
  openingFee: number;
  totalInsurance: number;
  /** Coste total del préstamo = capital + intereses. */
  totalLoanCost: number;
  /** Coste total de la operación = préstamo + gastos compra + apertura + seguros. */
  totalOperationCost: number;
  /** TAE aproximada (%). */
  aprApprox: number;
  effort: EffortRatio;
}

const round2 = (n: number): number => Math.round(n * 100) / 100;

/** Capital efectivo a financiar. */
export function resolvePrincipal(inputs: MortgageInputs): number {
  return inputs.principal ?? inputs.price - inputs.savings;
}

/** Tipo de interés nominal anual (%) efectivo aplicado. */
export function effectiveAnnualRate(inputs: MortgageInputs): number {
  switch (inputs.interestMode) {
    case "fija":
      return inputs.fixedRate ?? 0;
    case "variable":
      return (inputs.euribor ?? 0) + (inputs.spread ?? 0);
    case "mixta":
      // Usamos el TIN fijo como referencia principal para la cuota inicial.
      return inputs.fixedRate ?? (inputs.euribor ?? 0) + (inputs.spread ?? 0);
    default:
      return 0;
  }
}

/** Cuota constante del sistema francés. */
export function frenchPayment(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  if (months <= 0) throw new Error("El plazo debe ser mayor que 0 meses.");
  if (monthlyRate === 0) return principal / months;
  const factor = Math.pow(1 + monthlyRate, months);
  return (principal * monthlyRate * factor) / (factor - 1);
}

function validate(inputs: MortgageInputs, principal: number): void {
  const rate = effectiveAnnualRate(inputs);
  if (rate < 0) throw new Error("El tipo de interés no puede ser negativo.");
  if (inputs.termYears <= 0)
    throw new Error("El plazo de amortización debe ser mayor que 0 años.");
  if (principal <= 0)
    throw new Error("El capital a financiar debe ser mayor que 0.");
  if (principal > inputs.price)
    throw new Error(
      "El capital a financiar no puede superar el precio de la vivienda."
    );
  if (inputs.netMonthlyIncome < 0)
    throw new Error("Los ingresos netos no pueden ser negativos.");
}

/** Construye el cuadro de amortización del sistema francés. */
export function buildSchedule(
  principal: number,
  monthlyRate: number,
  totalMonths: number
): AmortizationRow[] {
  const rows: AmortizationRow[] = [];
  let balance = principal;
  const payment = frenchPayment(principal, monthlyRate, totalMonths);

  for (let month = 1; month <= totalMonths && balance > 0.005; month++) {
    const interest = balance * monthlyRate;
    let principalPaid = payment - interest;
    if (principalPaid > balance) principalPaid = balance;
    balance = round2(balance - principalPaid);

    const interestR = round2(interest);
    const principalR = round2(principalPaid);
    rows.push({
      month,
      payment: round2(interestR + principalR),
      interest: interestR,
      principalPaid: principalR,
      remainingBalance: balance,
    });
  }

  return rows;
}

/** TAE aproximada por bisección sobre el flujo de caja real del préstamo. */
export function approximateAPR(
  netReceived: number,
  schedule: AmortizationRow[],
  monthlyInsurance: number
): number {
  // netReceived = capital menos comisiones/gastos que reducen lo recibido.
  const cashflows: number[] = [netReceived];
  for (const row of schedule) {
    cashflows.push(-(row.payment + monthlyInsurance));
  }

  const npv = (monthlyRate: number): number =>
    cashflows.reduce((acc, cf, i) => acc + cf / Math.pow(1 + monthlyRate, i), 0);

  // Desde la óptica del prestatario el VAN es negativo a tipo 0 y crece con el
  // tipo (al descontar los pagos futuros). Buscamos la raíz por bisección.
  let lo = 0;
  let hi = 1; // 100% mensual como techo
  if (npv(hi) < 0) return 0; // sin raíz en el rango
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const v = npv(mid);
    if (Math.abs(v) < 1e-6) return round2((Math.pow(1 + mid, 12) - 1) * 100);
    if (v < 0) lo = mid;
    else hi = mid;
  }
  const monthly = (lo + hi) / 2;
  return round2((Math.pow(1 + monthly, 12) - 1) * 100);
}

export function computeMortgage(inputs: MortgageInputs): MortgageResult {
  const principal = resolvePrincipal(inputs);
  validate(inputs, principal);

  const annualRate = effectiveAnnualRate(inputs);
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = Math.round(inputs.termYears * 12);

  const monthlyPayment = frenchPayment(principal, monthlyRate, totalMonths);
  const schedule = buildSchedule(principal, monthlyRate, totalMonths);

  const actualMonths = schedule.length;
  const totalInterest = round2(
    schedule.reduce((acc, r) => acc + r.interest, 0)
  );

  const purchaseCosts = round2((inputs.purchaseCostsPct / 100) * inputs.price);
  const openingFee = round2(((inputs.openingFeePct ?? 0) / 100) * principal);
  const monthlyInsurance = inputs.monthlyInsurance ?? 0;
  const totalInsurance = round2(monthlyInsurance * actualMonths);

  const totalLoanCost = round2(principal + totalInterest);
  const totalOperationCost = round2(
    totalLoanCost + purchaseCosts + openingFee + totalInsurance
  );

  const netReceived = round2(principal - openingFee);
  const aprApprox = approximateAPR(
    netReceived,
    schedule,
    monthlyInsurance
  );

  const monthlyBurden = monthlyPayment + monthlyInsurance + inputs.otherMonthlyDebts;
  const ratio =
    inputs.netMonthlyIncome > 0 ? monthlyBurden / inputs.netMonthlyIncome : 0;
  const effort: EffortRatio = {
    ratio,
    warning: ratio > 0.35,
    danger: ratio > 0.4,
  };

  return {
    principal: round2(principal),
    monthlyRate,
    monthlyPayment: round2(monthlyPayment),
    schedule,
    actualMonths,
    totalInterest,
    purchaseCosts,
    openingFee,
    totalInsurance,
    totalLoanCost,
    totalOperationCost,
    aprApprox,
    effort,
  };
}

/** Serializa el cuadro de amortización a CSV. */
export function scheduleToCSV(schedule: AmortizationRow[]): string {
  const header = "Mes,Cuota,Interes,Capital,Capital pendiente";
  const lines = schedule.map(
    (r) =>
      `${r.month},${r.payment},${r.interest},${r.principalPaid},${r.remainingBalance}`
  );
  return [header, ...lines].join("\n");
}
