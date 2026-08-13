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
        <button type="button">Parse quote</button>
      </div>

      {/* results area goes here */}
    </main>
  )
}