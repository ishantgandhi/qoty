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
    <main className="max-w-2xl mx-auto w-full px-4 py-16 font-sans">
      <header className="mb-10 flex items-center justify-center gap-3">
        <img
          src="/qoty.png"
          alt=""
          width={64}
          height={64}
          className="h-16 w-16 rounded-full"
        />
        <h1 className="text-3xl font-medium">Qoty</h1>
      </header>

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

      {error && <p className="mt-4 text-center text-red-600">{error}</p>}

      {result && <QuoteResults result={result} />}
    </main>
  );
}
