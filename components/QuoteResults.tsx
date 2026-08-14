'use client';

import { motion } from 'framer-motion';
import { ResultRow } from '@/components/ResultRow';
import { BREAKDOWN_FIELDS, type QuoteResult } from '@/lib/quote';

const list = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } },
};

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
      <motion.h2
        className="mb-6 text-2xl font-bold"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Results
      </motion.h2>
      <motion.div variants={list} initial="hidden" animate="show" className="space-y-4">
        <motion.div variants={item}>
          <TotalQuoteCard result={result} />
        </motion.div>
        <motion.hr variants={item} className="border-gray-200" />
        {BREAKDOWN_FIELDS.map(({ key, label }) => (
          <motion.div key={key} variants={item}>
            <ResultRow
              label={label}
              value={result[key].value}
              basis={result[key].basis}
              isEstimate={result[key].is_estimate}
            />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
