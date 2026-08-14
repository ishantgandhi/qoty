import { formatCurrency } from '@/lib/quote';

export function InfoTooltip({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <span className="type-meta cursor-default text-gray-400">ⓘ</span>
      <span className="type-fine absolute left-0 top-full z-10 mt-1 hidden w-56 rounded-md bg-neutral-800 px-2 py-1.5 text-white group-hover:block">
        {text}
      </span>
    </span>
  );
}

export function ResultRow({
  label,
  value,
  basis,
  emphasize = false,
  isEstimate = false,
}: {
  label: string;
  value: number | null;
  basis: string;
  emphasize?: boolean;
  isEstimate?: boolean;
}) {
  const amountClass = emphasize ? 'type-metric' : 'type-metric-sm';
  const colorClass = value == null ? 'text-gray-400' : emphasize ? 'text-amber-500' : 'text-amber-400';

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`${amountClass} ${colorClass}`}>
          {value == null ? 'Not found' : formatCurrency(value)}
        </span>
        {isEstimate && value != null && (
          <span className="type-meta text-amber-600">est.</span>
        )}
        <InfoTooltip text={basis} />
      </div>
      <span className="type-label">{label}</span>
    </div>
  );
}
