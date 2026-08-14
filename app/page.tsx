'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { QuoteForm } from '@/components/QuoteForm';
import { QuoteResults } from '@/components/QuoteResults';
import { buildQuoteInputs, type QuoteResult } from '@/lib/quote';

export default function Home() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    setResult(null);

    const inputs = await buildQuoteInputs(text, files);
    if (inputs.length === 0) {
      setError('No input provided');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse quote');
      }
      setResult(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-2xl mx-auto w-full px-4 py-16 font-sans">
      <motion.header
        className="mb-10 flex items-center justify-center gap-3"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
      >
        <motion.img
          src="/qoty.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.05 }}
        />
        <h1 className="text-3xl font-medium">Qoty</h1>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut', delay: 0.12 }}
      >
        <QuoteForm
          text={text}
          files={files}
          loading={loading}
          onTextChange={setText}
          onFilesChange={setFiles}
          onSubmit={handleSubmit}
          onClear={() => {
            setText('');
            setFiles([]);
            setResult(null);
            setError(null);
          }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            className="mt-4 text-center text-red-600"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <QuoteResults result={result} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
