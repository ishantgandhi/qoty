'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  function readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });
  }

  function readFileAsBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  function looksLikeHtml(text: string): boolean {
    return /<[a-z][\s\S]*>/i.test(text);
  }

  async function handleSubmit() {
    setError(null);
    setResult(null);

    const inputs: { type: string; content: string; label: string }[] = [];

    // handle the pasted text, if any
    if (text.trim()) {
      inputs.push({ type: looksLikeHtml(text) ? 'html' : 'text', content: text, label: 'Pasted text' });
    }

    // handle each uploaded file
    for (const file of files) {
      const isPdf = file.type.startsWith('application/pdf') || file.name.toLowerCase().endsWith('.pdf');
      const content = isPdf ? await readFileAsBase64(file) : await readFileAsText(file);
      inputs.push({ type: isPdf ? 'pdf' : 'html', content, label: file.name });
    }

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
      } else {
        setResult(data);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(value: number): string {
    return value.toLocaleString('en-US', { // inbuilt function to format currency
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    });
  }

  function FieldCard({ label, field }: { label: string; field: { value: number | null; basis: string; is_estimate: boolean } }) {
    return (
      <div className="border border-gray-200 rounded-md p-4">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className="text-xl font-medium mb-1">
          {field.value == null ? 'Not found' : formatCurrency(field.value)}
          {field.is_estimate && ' (estimate)'}
        </div>
        <div className="text-sm text-gray-400">{field.basis}</div>
      </div>
    );
  }

  function TotalQuoteCard({ result }: { result: any }) {
    const { total_quote, total_quote_check } = result;
    const mismatch =
      total_quote_check?.computed_value != null && !total_quote_check.matches_extraction;

    if (!mismatch) {
      return <FieldCard label="Total Quote" field={total_quote} />;
    }

    return (
      <div className="border border-gray-200 rounded-md p-4">
        <div className="text-sm text-gray-500 mb-3">
          Total quote — two figures found, they differ
        </div>
        <div className="grid grid-cols-2 gap-4 mb-2">
          <div>
            <div className="text-xs text-gray-400 mb-1">Extracted</div>
            <div className="text-lg font-medium">
              {formatCurrency(total_quote.value)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-400 mb-1">Calculated</div>
            <div className="text-lg font-medium">
              {formatCurrency(total_quote_check.computed_value)}
            </div>
          </div>
        </div>
        <div className="text-sm text-gray-400">
          Review the component breakdown below.
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="font-serif text-2xl text-center mb-10">
        Hotel Quote Parser
      </h1>

      <div>
        <textarea
          className="w-full h-48 p-4 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Paste your hotel quote here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          multiple
          accept=".html,.htm,.pdf,.txt"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
        />
        <button type="button" onClick={handleSubmit}>Parse quote</button>
      </div>

      {/* results area goes here */}
      {loading && <p className="text-center text-gray-500">Extracting...</p>}

      {error && <p className="text-center text-red-600">{error}</p>}

      {result && (
        <div className="space-y-3">
          <TotalQuoteCard result={result} />
          <FieldCard label="Guestroom Total" field={result.guestroom_total} />
          <FieldCard label="Meeting Room Total" field={result.meeting_room_total} />
          <FieldCard label="F&B Total" field={result.fb_total} />
        </div>
      )}
    </main>
  );
}