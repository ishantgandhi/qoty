import { AmountColumn, Card, FieldCard } from "@/components/FieldCard";
import { BREAKDOWN_FIELDS, type QuoteResult } from "@/lib/quote";

function TotalQuoteCard({ result }: { result: QuoteResult }) {
  const { total_quote, total_quote_check } = result;
  const computed = total_quote_check?.computed_value ?? null;
  const mismatch = computed != null && !total_quote_check?.matches_extraction;

  if (!mismatch) {
    return <FieldCard label="Total Quote" field={total_quote} />;
  }

  return (
    <Card>
      <div className="text-sm text-gray-500 mb-3">
        Total quote — two figures found, they differ
      </div>
      <div className="grid grid-cols-2 gap-4 mb-2">
        <AmountColumn label="Extracted" value={total_quote.value} />
        <AmountColumn label="Calculated" value={computed} />
      </div>
      <div className="text-sm text-gray-400">
        Review the component breakdown below.
      </div>
    </Card>
  );
}

export function QuoteResults({ result }: { result: QuoteResult }) {
  return (
    <div className="space-y-3">
      <TotalQuoteCard result={result} />
      {BREAKDOWN_FIELDS.map(({ key, label }) => (
        <FieldCard key={key} label={label} field={result[key]} />
      ))}
    </div>
  );
}
