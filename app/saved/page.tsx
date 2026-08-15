'use client';

import { useEffect, useState } from 'react';
import { SavedQuoteItem } from '@/components/SavedQuoteItem';
import type { SavedQuote } from '@/lib/quote';

export default function Saved() {
  const [quotes, setQuotes] = useState<SavedQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchQuotes() {
      try {
        const res = await fetch('/api/quotes');
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'Failed to load quotes.');
        } else {
          setQuotes(data.quotes);
        }
      } catch {
        setError('Could not reach the server.');
      } finally {
        setLoading(false);
      }
    }
    fetchQuotes();
  }, []);

  return (
    <main>
      {loading && <p className="type-meta text-center text-gray-500">Loading...</p>}
      {error && <p className="type-meta text-center text-red-600">{error}</p>}
      {!loading && quotes.length === 0 && (
        <p className="type-meta text-center text-gray-500">Sorry, no quotes found.</p>
      )}
      {!loading && quotes.length > 0 && (
        <ul className="space-y-4">
          {quotes.map((quote) => (
            <SavedQuoteItem
              key={quote.id}
              quote={quote}
              onUnsave={(id) => setQuotes((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </ul>
      )}
    </main>
  );
}
