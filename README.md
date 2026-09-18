# Martita's Dream: Pisazo en Boadilla 🐾🎿

Simulador de hipotecas (React + TypeScript + Tailwind + Recharts, sobre Vite).

## Arranque

```bash
npm install
npm run dev     # http://localhost:5173
npm run test    # tests unitarios de la lógica financiera
npm run build   # build de producción
```

## Arquitectura

- `src/lib/mortgage.ts` — lógica financiera **pura**, sin UI.
- `src/lib/mortgage.test.ts` — 15 tests unitarios (Vitest).
- `src/components/` — UI reutilizable: `InputPanel`, `SummaryCards`,
  `AmortizationChart`, `AmortizationTable`, `ui`, `icons`.
- `src/App.tsx` — layout y estado.

## Fórmulas y supuestos

- **Sistema de amortización francés** (cuota constante):
  `cuota = C · i / (1 − (1+i)^−n)`, con `i` = tipo mensual (TIN/12) y `n` meses.
  Caso 0% → reparto lineal `C / n`.
- **Cuadro de amortización** mes a mes: interés = saldo · i; capital = cuota − interés;
  las partes se redondean a 2 decimales y la cuota se recompone como su suma
  (así `interés + capital = cuota` exacto en cada fila).
- **Interés efectivo**: fija → TIN; variable → Euríbor + diferencial; mixta → usa
  el TIN del tramo fijo como referencia de la cuota inicial.
- **Gastos de compra**: % sobre el precio (ITP/IVA, notaría, registro, gestoría,
  tasación; por defecto 11%). **Comisión de apertura**: % sobre el capital.
- **TAE aproximada**: TIR anualizada del flujo de caja real (capital recibido menos
  comisiones, frente a cuotas + seguros), resuelta por bisección.
- **Ratio de esfuerzo** = (cuota + seguros + otras deudas) / ingresos netos.
  Alerta ámbar >35%, roja >40%.

Cálculos orientativos; no constituyen oferta ni asesoramiento financiero.
