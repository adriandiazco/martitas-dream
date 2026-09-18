import { useState, type ReactNode } from "react";

export const eur = (n: number): string =>
  n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

export const eur2 = (n: number): string =>
  n.toLocaleString("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const pct = (n: number): string =>
  `${(n * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;

/** Icono de ayuda con tooltip accesible. */
export function Info({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex align-middle">
      <button
        type="button"
        aria-label={`Ayuda: ${text}`}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onBlur={() => setOpen(false)}
        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full border border-ice-300 text-[10px] font-bold text-ice-500 hover:bg-ice-100"
      >
        i
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 top-6 z-20 w-56 -translate-x-1/2 rounded-lg border border-ice-200 bg-white p-2 text-xs leading-snug text-ice-800 shadow-lg"
        >
          {text}
        </span>
      )}
    </span>
  );
}

export function Field({
  label,
  info,
  children,
}: {
  label: string;
  info?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="flex items-center font-medium text-ice-700">
        {label}
        {info && <Info text={info} />}
      </span>
      {children}
    </label>
  );
}

export function NumberInput({
  value,
  onChange,
  step = 1,
  min,
  suffix,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  return (
    <span className="flex items-center rounded-lg border border-ice-200 bg-white focus-within:ring-2 focus-within:ring-gold-400">
      <input
        type="number"
        className="tnum w-full rounded-lg bg-transparent px-3 py-2 text-ice-900 outline-none"
        value={Number.isFinite(value) ? value : ""}
        step={step}
        min={min}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
      {suffix && <span className="pr-3 text-sm text-ice-400">{suffix}</span>}
    </span>
  );
}

export function Card({
  title,
  icon,
  children,
  className = "",
}: {
  title?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-ice-100 bg-white/80 p-4 shadow-sm backdrop-blur ${className}`}
    >
      {title && (
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-ice-500">
          {icon}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}
