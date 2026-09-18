import { describe, it, expect } from "vitest";
import {
  computeMortgage,
  frenchPayment,
  type MortgageInputs,
} from "./mortgage";

const base: MortgageInputs = {
  price: 250000,
  savings: 0,
  interestMode: "fija",
  fixedRate: 3,
  termYears: 30,
  netMonthlyIncome: 4000,
  otherMonthlyDebts: 0,
  purchaseCostsPct: 11,
};

describe("cuota sistema francés", () => {
  it("caso típico 250.000€ / 30 años / 3% ≈ 1.054 €/mes", () => {
    const r = computeMortgage(base);
    // Valor conocido de simuladores estándar: ~1054,01 €
    expect(r.monthlyPayment).toBeGreaterThan(1053);
    expect(r.monthlyPayment).toBeLessThan(1055);
  });

  it("interés 0% reparte capital linealmente", () => {
    const r = computeMortgage({ ...base, fixedRate: 0 });
    expect(r.monthlyPayment).toBeCloseTo(250000 / 360, 2);
    expect(r.totalInterest).toBeCloseTo(0, 2);
  });

  it("plazo de 1 mes: la cuota salda todo el capital + interés", () => {
    const r = computeMortgage({
      ...base,
      termYears: 1 / 12,
      fixedRate: 3,
    });
    expect(r.actualMonths).toBe(1);
    expect(r.schedule[0].remainingBalance).toBeCloseTo(0, 2);
    // cuota ≈ capital * (1 + i)
    expect(r.monthlyPayment).toBeCloseTo(250000 * (1 + 0.03 / 12), 0);
  });
});

describe("cuadro de amortización coherente", () => {
  it("interés + capital = cuota en cada fila y saldo llega a 0", () => {
    const r = computeMortgage(base);
    for (const row of r.schedule) {
      expect(row.interest + row.principalPaid).toBeCloseTo(row.payment, 2);
    }
    expect(r.schedule[r.schedule.length - 1].remainingBalance).toBeCloseTo(0, 1);
  });
});

describe("ratio de esfuerzo", () => {
  it("salta la alerta por encima del 35%", () => {
    const r = computeMortgage({ ...base, netMonthlyIncome: 2500 });
    expect(r.effort.ratio).toBeGreaterThan(0.35);
    expect(r.effort.warning).toBe(true);
  });

  it("no salta por debajo del 35%", () => {
    const r = computeMortgage({ ...base, netMonthlyIncome: 6000 });
    expect(r.effort.ratio).toBeLessThan(0.35);
    expect(r.effort.warning).toBe(false);
  });
});

describe("interés variable", () => {
  it("usa euríbor + diferencial, no un valor fijo", () => {
    const r = computeMortgage({
      ...base,
      interestMode: "variable",
      fixedRate: undefined,
      euribor: 2.5,
      spread: 0.8,
    });
    // 3,3% anual debe dar cuota distinta (mayor) que 3%
    const at3 = frenchPayment(250000, 0.03 / 12, 360);
    expect(r.monthlyPayment).toBeGreaterThan(at3);
  });
});

describe("TAE aproximada", () => {
  it("≈ TIN cuando no hay comisiones ni seguros", () => {
    const r = computeMortgage(base); // 3% sin seguros/comisión
    expect(r.aprApprox).toBeGreaterThan(2.9);
    expect(r.aprApprox).toBeLessThan(3.1);
  });
  it("> TIN cuando hay seguros y comisión de apertura", () => {
    const r = computeMortgage({
      ...base,
      monthlyInsurance: 45,
      openingFeePct: 0.5,
    });
    expect(r.aprApprox).toBeGreaterThan(3);
  });
});

describe("validaciones", () => {
  it("rechaza interés negativo", () => {
    expect(() => computeMortgage({ ...base, fixedRate: -1 })).toThrow();
  });
  it("rechaza plazo 0", () => {
    expect(() => computeMortgage({ ...base, termYears: 0 })).toThrow();
  });
  it("rechaza capital mayor que precio", () => {
    expect(() =>
      computeMortgage({ ...base, principal: 300000 })
    ).toThrow();
  });
});
