'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { formatCurrency } from '@/lib/quote';

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.span
      className="inline-flex text-gray-400"
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
  const [open, setOpen] = useState(false);
  const amountClass = emphasize ? 'type-metric' : 'type-metric-sm';
  const colorClass = value == null ? 'text-gray-400' : emphasize ? 'text-amber-500' : 'text-amber-400';

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className={`${amountClass} ${colorClass}`}>
            {value == null ? 'Not found' : formatCurrency(value)}
          </span>
          {isEstimate && value != null && (
            <span className="type-meta text-amber-600">est.</span>
          )}
          <Chevron open={open} />
        </div>
        <span className="type-label">{label}</span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.p
            key="basis"
            className="type-fine overflow-hidden pt-2 text-gray-500"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {basis}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
