'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { ResultRow } from '@/components/ResultRow';
import {
  BREAKDOWN_FIELDS,
  formatCurrency,
  formatSourceType,
  type SavedQuote,
} from '@/lib/quote';

function formatSavedAt(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function SavedQuoteItem({ quote }: { quote: SavedQuote }) {
  const [open, setOpen] = useState(false);
  const basis = quote.field_basis;

  return (
    <li className="rounded-xl border border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left"
      >
        <span className={`type-metric-sm ${quote.total_quote == null ? 'text-gray-400' : 'text-amber-400'}`}>
          {quote.total_quote == null ? 'Not found' : formatCurrency(quote.total_quote)}
        </span>
        <span className="flex min-w-0 items-center gap-3">
          <span className="type-meta text-gray-500">{formatSourceType(quote.source_type)}</span>
          <span className="type-fine truncate text-gray-400">{formatSavedAt(quote.created_at)}</span>
          <motion.span
            className="inline-flex shrink-0 text-gray-400"
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path
                d="M2.5 4.5L6 8L9.5 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="breakdown"
            className="overflow-hidden border-t border-gray-200 px-4 pb-4"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="space-y-4 pt-4">
              <ResultRow
                label="Total"
                value={quote.total_quote}
                basis={basis?.total_quote.basis ?? 'Saved total'}
                isEstimate={basis?.total_quote.is_estimate ?? false}
                emphasize
              />
              <hr className="border-gray-200" />
              {BREAKDOWN_FIELDS.map(({ key, label }) => (
                <ResultRow
                  key={key}
                  label={label}
                  value={quote[key]}
                  basis={basis?.[key].basis ?? 'Saved value'}
                  isEstimate={basis?.[key].is_estimate ?? false}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
