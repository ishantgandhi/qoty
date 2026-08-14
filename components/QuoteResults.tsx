import { ResultRow } from '@/components/ResultRow';
import { BREAKDOWN_FIELDS, type QuoteResult } from '@/lib/quote';

function TotalQuoteCard({ result }: { result: QuoteResult }) {
  const { total_quote, total_quote_check } = result;
  const computed = total_quote_check?.computed_value ?? null;
  const mismatch = computed != null && !total_quote_check?.matches_extraction;

  if (!mismatch) {
    return (
      <ResultRow
        label="Total"
        value={total_quote.value}
        basis={total_quote.basis}
        isEstimate={total_quote.is_estimate}
        emphasize
      />
    );
  }

  return (
    <div className="space-y-3">
      <ResultRow
        label="Total"
        value={total_quote.value}
        basis={total_quote.basis}
        isEstimate={total_quote.is_estimate}
        emphasize
      />
      <p className="text-xs text-gray-400">
        Two figures found, they differ. Review the component breakdown below.
      </p>
      <ResultRow
        label="Calculated"
        value={computed}
        basis="Sum of guestroom, meeting room, and F&B totals"
      />
    </div>
  );
}

export function QuoteResults({ result }: { result: QuoteResult }) {
  return (
    <section className="mt-10">
      <h2 className="mb-6 text-2xl font-bold">Results</h2>
      <TotalQuoteCard result={result} />
      <hr className="my-4 border-gray-200" />
      <div className="space-y-4">
        {BREAKDOWN_FIELDS.map(({ key, label }) => (
          <ResultRow
            key={key}
            label={label}
            value={result[key].value}
            basis={result[key].basis}
            isEstimate={result[key].is_estimate}
          />
        ))}
      </div>
    </section>
  );
}
