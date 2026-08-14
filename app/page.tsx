'use client';

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
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-2xl text-center mb-10">
        Hotel Quote Parser
      </h1>

      <QuoteForm
        text={text}
        onTextChange={setText}
        onFilesChange={setFiles}
        onSubmit={handleSubmit}
      />

      {loading && <p className="text-center text-gray-500">Extracting...</p>}
      {error && <p className="text-center text-red-600">{error}</p>}
      {result && <QuoteResults result={result} />}
    </main>
  );
}
