import { formatCurrency, formatFieldAmount, type QuoteField } from "@/lib/quote";

export function Card({ children }: { children: React.ReactNode }) {
  return <div className="border border-gray-200 rounded-md p-4">{children}</div>;
}

export function FieldCard({ label, field }: { label: string; field: QuoteField }) {
  return (
    <Card>
      <div className="text-sm text-gray-500 mb-1">{label}</div>
      <div className="text-xl font-medium mb-1">{formatFieldAmount(field)}</div>
      <div className="text-sm text-gray-400">{field.basis}</div>
    </Card>
  );
}

export function AmountColumn({ label, value }: { label: string; value: number | null }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-1">{label}</div>
      <div className="text-lg font-medium">
        {value == null ? "Not found" : formatCurrency(value)}
      </div>
    </div>
  );
}
