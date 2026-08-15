'use client';

import { motion } from 'framer-motion';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

type SaveButtonProps = {
  saveStatus: SaveStatus;
  onSave: () => void;
};

export function SaveButton({ saveStatus, onSave }: SaveButtonProps) {
  const label = {
    idle: 'Save quote',
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Failed to save — try again',
  }[saveStatus];

  const isDisabled = saveStatus === 'saving' || saveStatus === 'saved';

  const className = {
    idle: 'border border-gray-300 bg-white text-gray-900',
    saving: 'border border-amber-400 bg-amber-400 text-black',
    saved: 'border border-gray-200 bg-gray-50 text-gray-500',
    error: 'border border-red-300 bg-white text-red-600',
  }[saveStatus];

  return (
    <motion.button
      type="button"
      onClick={onSave}
      disabled={isDisabled}
      className={`type-button mt-6 w-full rounded-xl py-3 disabled:opacity-60 ${className}`}
      whileHover={
        isDisabled
          ? undefined
          : saveStatus === 'error'
            ? { scale: 1.015, borderColor: '#fca5a5' }
            : { scale: 1.015, borderColor: '#fbbf24' }
      }
      whileTap={
        isDisabled
          ? undefined
          : saveStatus === 'error'
            ? { scale: 0.985, backgroundColor: '#fee2e2' }
            : { scale: 0.985, backgroundColor: '#fbbf24', borderColor: '#fbbf24', color: '#000000' }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {label}
    </motion.button>
  );
}
