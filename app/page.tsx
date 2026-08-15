'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { QuoteForm } from '@/components/QuoteForm';
import { QuoteResults } from '@/components/QuoteResults';
import { SaveButton } from '@/components/SaveButton';
import { buildQuoteInputs, type QuoteResult } from '@/lib/quote';

export default function Home() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  async function handleSubmit() {
    setError(null);
    setResult(null);
    setSaveStatus('idle');

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

  async function handleSave() {
    if (!result) return;
    setError(null);
    setSaveStatus('saving');
    try {
      const response = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(result),
      });
      const data = await response.json();
      if (!response.ok) {
        setSaveStatus('error');
        setError(data.error || 'Failed to save quote');
        return;
      }
      setSaveStatus('saved');
    } catch {
      setSaveStatus('error');
      setError('Failed to save quote');
    }
  }

  return (
    <main>
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
            setSaveStatus('idle');
          }}
        />
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            key="error"
            className="mt-4 text-center type-meta text-red-600"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 1 }}
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
            <SaveButton saveStatus={saveStatus} onSave={handleSave} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
